import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCategories } from "../../api/categories";
import { getProduits, getImagesProduits } from "../../api/produits";
import { getMarques, getModeles, getProduitMarques, getProduitModeles } from "../../api/marques";
import { findCategoryBySlug, getCategoryBreadcrumb, getSubcategoryIds } from "../../utils/categoryTree";
import ProductCard from "../../components/ProductCard";
import Breadcrumb from "../../components/Breadcrumb";
import Pagination from "../../components/Pagination";
import BrandModelFilter from "../../components/BrandModelFilter";
import { Loader2, Layers } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const IS_LOCAL = typeof window !== "undefined" && window.location.port === "5173";
const IMAGE_BASE = IS_LOCAL ? "http://localhost:3500/api/uploads/" : "/api/uploads/";

const getCatImageUrl = (img, useFallback = false) => {
  if (!img) return null;
  let fn;
  if (!useFallback) {
    fn = IS_LOCAL ? (img.image || img.slug_image || "") : (img.slug_image || img.image || "");
  } else {
    fn = IS_LOCAL ? (img.slug_image || img.image || "") : (img.image || img.slug_image || "");
  }
  fn = fn.normalize("NFC");
  return fn ? `${IMAGE_BASE}${encodeURIComponent(fn)}` : null;
};

const matchProduit = (img, productId) =>
  String(img.id_produit?._id || img.id_produit) === String(productId);

export default function CategoryPage() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [produits, setProduits] = useState([]);
  const [images, setImages] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [produitMarques, setProduitMarques] = useState([]);
  const [produitModeles, setProduitModeles] = useState([]);
  const [selectedMarque, setSelectedMarque] = useState(null);
  const [selectedModele, setSelectedModele] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    setSelectedMarque(null);
    setSelectedModele(null);
    setLoading(true);
    Promise.all([
      getCategories(),
      getProduits(),
      getImagesProduits(),
      getMarques(),
      getModeles(),
      getProduitMarques(),
      getProduitModeles(),
    ])
      .then(([catRes, prodRes, imgRes, marqRes, modRes, pmRes, pmodeRes]) => {
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []);
        setProduits(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || []);
        setImages(Array.isArray(imgRes.data) ? imgRes.data : imgRes.data?.data || []);
        setMarques(Array.isArray(marqRes.data) ? marqRes.data : []);
        setModeles(Array.isArray(modRes.data) ? modRes.data : []);
        setProduitMarques(Array.isArray(pmRes.data) ? pmRes.data : []);
        setProduitModeles(Array.isArray(pmodeRes.data) ? pmodeRes.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    setCurrentPage(1);
  }, [slug]);

  const currentCat = findCategoryBySlug(categories, slug);

  const breadcrumb = currentCat
    ? getCategoryBreadcrumb(categories, currentCat._id).map((c) => ({
        label: c.nom,
        href: `/categorie/${c.slug || c._id}`,
      }))
    : [];

  const directChildren = categories.filter(
    (c) => String(c.categorieParent?._id || c.categorieParent) === String(currentCat?._id)
  );

  const isLeaf = directChildren.length === 0;

  const subcatIds = currentCat ? getSubcategoryIds(categories, currentCat._id) : [];

  // Produits directement rattachés à CETTE catégorie (pas aux sous-catégories)
  const directProducts = produits.filter((p) => {
    const catId = p.categorie?._id || p.categorie;
    return String(catId) === String(currentCat?._id);
  });

  let filtered = produits.filter((p) => {
    const catId = p.categorie?._id || p.categorie;
    return subcatIds.includes(catId);
  });

  if (selectedMarque) {
    const ids = produitMarques
      .filter((pm) => String(pm.marque?._id || pm.marque) === String(selectedMarque._id))
      .map((pm) => String(pm.produit?._id || pm.produit));
    filtered = filtered.filter((p) => ids.includes(String(p._id)));
  }
  if (selectedModele) {
    const ids = produitModeles
      .filter((pm) => String(pm.modele?._id || pm.modele) === String(selectedModele._id))
      .map((pm) => String(pm.produit?._id || pm.produit));
    filtered = filtered.filter((p) => ids.includes(String(p._id)));
  }
  if (inStockOnly) filtered = filtered.filter((p) => p.quantiteStock > 0);
  if (priceMin) filtered = filtered.filter((p) => (p.prix || 0) >= parseFloat(priceMin));
  if (priceMax) filtered = filtered.filter((p) => (p.prix || 0) <= parseFloat(priceMax));
  if (sortBy === "asc") filtered = [...filtered].sort((a, b) => (a.prix || 0) - (b.prix || 0));
  else if (sortBy === "desc") filtered = [...filtered].sort((a, b) => (b.prix || 0) - (a.prix || 0));

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumb.length > 0 ? breadcrumb : [{ label: slug }]} />

      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
        {currentCat?.nom || slug}
      </h1>

      {currentCat?.description && (
        <p className="text-gray-500 text-sm mb-6">{currentCat.description}</p>
      )}

      {!isLeaf ? (
        <>
          <SubcategoryGrid children={directChildren} images={images} />
          {directProducts.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Produits de cette catégorie
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {directProducts.map((p) => (
                  <ProductCard key={p._id} product={p} images={images} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <LeafContent
          filtered={filtered}
          paginated={paginated}
          images={images}
          marques={marques}
          modeles={modeles}
          selectedMarque={selectedMarque}
          selectedModele={selectedModele}
          sortBy={sortBy}
          priceMin={priceMin}
          priceMax={priceMax}
          inStockOnly={inStockOnly}
          currentPage={currentPage}
          totalPages={totalPages}
          onMarqueChange={(m) => { setSelectedMarque(m); setCurrentPage(1); }}
          onModeleChange={(m) => { setSelectedModele(m); setCurrentPage(1); }}
          onSortChange={setSortBy}
          onPriceMinChange={setPriceMin}
          onPriceMaxChange={setPriceMax}
          onStockChange={setInStockOnly}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

function SubcategoryGrid({ children, images }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mt-4">
      {children.map((cat) => {
        const catImages = images.filter(
          (img) => String(img.id_produit?._id || img.id_produit) !== "undefined"
        );
        return (
          <SubcategoryCard key={cat._id} cat={cat} />
        );
      })}
    </div>
  );
}

function SubcategoryCard({ cat }) {
  const [imgError, setImgError] = useState(false);

  const imgUrl = cat.image
    ? (IS_LOCAL ? `http://localhost:3500/api/uploads/${encodeURIComponent(cat.image.normalize("NFC"))}` : `/api/uploads/${encodeURIComponent(cat.image.normalize("NFC"))}`)
    : null;

  return (
    <Link
      to={`/categorie/${cat.slug || cat._id}`}
      className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col"
    >
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {imgUrl && !imgError ? (
          <img
            src={imgUrl}
            alt={cat.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <Layers size={36} />
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {cat.nom}
        </h3>
        {cat.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>
        )}
        <span className="mt-auto pt-3 inline-block text-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors">
          Voir tout
        </span>
      </div>
    </Link>
  );
}

function LeafContent({
  filtered, paginated, images, marques, modeles,
  selectedMarque, selectedModele, sortBy, priceMin, priceMax, inStockOnly,
  currentPage, totalPages,
  onMarqueChange, onModeleChange, onSortChange,
  onPriceMinChange, onPriceMaxChange, onStockChange, onPageChange,
}) {
  return (
    <>
      <p className="text-gray-400 text-sm mb-6">{filtered.length} produit(s) trouvé(s)</p>
      <div className="flex gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
            <h3 className="font-semibold text-gray-900">Filtres</h3>
            <BrandModelFilter
              marques={marques}
              modeles={modeles}
              selectedMarque={selectedMarque}
              selectedModele={selectedModele}
              onMarqueChange={onMarqueChange}
              onModeleChange={onModeleChange}
            />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="default">Par défaut</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Fourchette de prix</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => onPriceMinChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => onPriceMaxChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onStockChange(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-700">En stock uniquement</span>
            </label>
          </div>
        </aside>

        <div className="flex-1">
          {paginated.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginated.map((p) => (
                  <ProductCard key={p._id} product={p} images={images} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-700">Aucun produit trouvé</h3>
              <p className="text-gray-500 text-sm mt-1">Essayez d'ajuster vos filtres</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
