import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProduits, getImagesProduits } from "../../api/produits";
import { getMarques, getModeles, getProduitMarques, getProduitModeles } from "../../api/marques";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination";
import BrandModelFilter from "../../components/BrandModelFilter";
import { Loader2, Search } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
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
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    setApiError(false);
    Promise.all([
      getProduits(),
      getImagesProduits(),
      getMarques(),
      getModeles(),
      getProduitMarques(),
      getProduitModeles(),
    ])
      .then(([prodRes, imgRes, marqRes, modRes, pmRes, pmodeRes]) => {
        setProduits(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || []);
        setImages(Array.isArray(imgRes.data) ? imgRes.data : imgRes.data?.data || []);
        setMarques(Array.isArray(marqRes.data) ? marqRes.data : []);
        setModeles(Array.isArray(modRes.data) ? modRes.data : []);
        setProduitMarques(Array.isArray(pmRes.data) ? pmRes.data : []);
        setProduitModeles(Array.isArray(pmodeRes.data) ? pmodeRes.data : []);
      })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
    setCurrentPage(1);
  }, [q]);

  let filtered = q
    ? produits.filter((p) => {
        const qLower = q.toLowerCase();
        return (
          (p.nom && p.nom.toLowerCase().includes(qLower)) ||
          (p.description && p.description.toLowerCase().includes(qLower)) ||
          (p.reference && p.reference.toLowerCase().includes(qLower))
        );
      })
    : [...produits];

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  if (apiError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-700 mb-2">Impossible de contacter le serveur</h2>
        <p className="text-gray-600 mb-1">Assurez-vous que le backend tourne sur <strong>http://localhost:3500</strong></p>
        <p className="text-gray-500 text-sm">Dans le dossier <code>pfe/</code>, exécutez : <strong>node server.js</strong></p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Search size={20} className="text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">
          {q ? `Résultats pour "${q}"` : "Tous les produits"}
        </h1>
        <span className="text-gray-500 text-sm">({filtered.length} résultat{filtered.length !== 1 ? "s" : ""})</span>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
            <h3 className="font-semibold text-gray-900">Filtres</h3>

            <BrandModelFilter
              marques={marques}
              modeles={modeles}
              selectedMarque={selectedMarque}
              selectedModele={selectedModele}
              onMarqueChange={(m) => { setSelectedMarque(m); setCurrentPage(1); }}
              onModeleChange={(m) => { setSelectedModele(m); setCurrentPage(1); }}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Trier par</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option value="default">Par défaut</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Fourchette de prix</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">En stock uniquement</span>
            </label>
          </div>
        </aside>

        <div className="flex-1">
          {paginated.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginated.map((p) => <ProductCard key={p._id} product={p} images={images} />)}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700">Aucun résultat</h3>
              <p className="text-gray-500 text-sm mt-1">Essayez d'autres filtres</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
