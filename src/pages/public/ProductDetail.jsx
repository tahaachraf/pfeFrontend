import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduits, getImagesProduits, getProduitsComplementaires, getPiecesJointes } from "../../api/produits";
import { getCategories } from "../../api/categories";
import { getCategoryBreadcrumb } from "../../utils/categoryTree";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import Breadcrumb from "../../components/Breadcrumb";
import toast from "react-hot-toast";
import { Loader2, ShoppingCart, Package, Clock, CheckCircle, XCircle, FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";

const IMAGE_BASE = "http://localhost:3500/api/uploads/";

// slug_image = URL propre (sans accents/espaces) → priorité dans le src
// img.image = fallback si le fichier slug n'existe pas encore
const getImageUrl = (img, useOriginal = false) => {
  if (!img) return null;
  const fn = useOriginal
    ? (img.image || img.slug_image || "").normalize("NFC")
    : (img.slug_image || img.image || "").normalize("NFC");
  return fn ? `${IMAGE_BASE}${encodeURIComponent(fn)}` : null;
};

const getPieceUrl = (pj) => {
  const filename = pj.url || pj.fichier || pj.nom || "";
  return filename ? `http://localhost:3500/api/pieces-jointes-files/${encodeURIComponent(filename)}` : "#";
};

const matchProduit = (img, productId) => {
  const imgProduitId = img.id_produit?._id || img.id_produit;
  return String(imgProduitId) === String(productId);
};

function CompactProductCard({ product, images = [] }) {
  const { addToCart } = useCart();
  const mainImage =
    images.find((img) => matchProduit(img, product._id) && img.ordreAffichage === 1) ||
    images.find((img) => matchProduit(img, product._id));
  const imageUrl = getImageUrl(mainImage);
  const isPromo = product.prixPromotion && product.prixPromotion < product.prix;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({ ...product, imageUrl });
    toast.success(`${product.nom} ajouté au panier !`);
  };

  return (
    <Link
      to={`/produit/${product.slug || product._id}`}
      className="group flex-shrink-0 w-36 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col"
    >
      <div className="relative bg-gray-50 aspect-square overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={mainImage?.texte_alternatif || product.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const fb = getImageUrl(mainImage, true);
              if (fb && !e.currentTarget.dataset.fb) {
                e.currentTarget.dataset.fb = "1";
                e.currentTarget.src = fb;
              } else {
                e.currentTarget.style.display = "none";
                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl"
          style={{ display: imageUrl ? "none" : "flex" }}>🛍️</div>
        {isPromo && (
          <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">PROMO</span>
        )}
        {product.quantiteStock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-[10px] font-medium px-2 py-0.5 rounded-full">Rupture</span>
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col flex-1">
        <p className="text-xs font-medium text-gray-900 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors leading-tight">
          {product.nom}
        </p>
        <div className="mt-2 flex items-center justify-between gap-1">
          <span className={`text-xs font-bold ${isPromo ? "text-red-600" : "text-blue-600"}`}>
            {formatPrice(isPromo ? product.prixPromotion : product.prix)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.quantiteStock === 0}
            className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-40 flex-shrink-0"
            title="Ajouter au panier"
          >
            <ShoppingCart size={12} />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complementaires, setComplementaires] = useState([]);
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [triedFallback, setTriedFallback] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    Promise.all([
      getProduits(),
      getImagesProduits(),
      getCategories(),
      getProduitsComplementaires(),
    ])
      .then(([prodRes, imgRes, catRes, compRes]) => {
        const prods = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || [];
        const imgs = Array.isArray(imgRes.data) ? imgRes.data : imgRes.data?.data || [];
        const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];
        const comp = Array.isArray(compRes.data) ? compRes.data : compRes.data?.data || [];

        const found = prods.find((p) => p.slug === slug || p._id === slug);
        setProduct(found || null);
        setAllProducts(prods);
        setImages(imgs);
        setCategories(cats);
        setComplementaires(comp);

        if (found) {
          getPiecesJointes(found._id)
            .then((pjRes) => {
              const pj = Array.isArray(pjRes.data) ? pjRes.data : pjRes.data?.data || [];
              setPiecesJointes(pj);
            })
            .catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Produit non trouvé
    </div>
  );

  // Filtrer et trier les images par ordreAffichage (1 en premier)
  const productImages = images
    .filter((img) => img.id_produit === product._id || img.id_produit?._id === product._id)
    .sort((a, b) => (a.ordreAffichage ?? 999) - (b.ordreAffichage ?? 999));

  const catId = product.categorie?._id || product.categorie;
  const breadcrumbItems = catId
    ? getCategoryBreadcrumb(categories, catId).map((c) => ({
        label: c.nom,
        href: `/categorie/${c.slug || c._id}`,
      }))
    : [];
  breadcrumbItems.push({ label: product.nom });

  const compIds = complementaires
    .filter((c) => {
      const mainId = c.produitId?._id || c.produitId;
      return mainId === product._id;
    })
    .map((c) => c.produitComplementaireId?._id || c.produitComplementaireId)
    .filter(Boolean);

  const compProducts = allProducts.filter((p) => compIds.includes(p._id));

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`${product.nom} ajouté au panier !`);
  };

  const isPromo = product.prixPromotion && product.prixPromotion < product.prix;
  const inStock = product.quantiteStock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          {/* Image principale — fallback à 2 étapes : img.image → slug_image → 🛍️ */}
          <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square mb-3 flex items-center justify-center">
            {productImages.length > 0 && !imageError ? (
              <img
                key={`${activeImage}-${triedFallback ? "fb" : "pr"}`}
                src={getImageUrl(productImages[activeImage], triedFallback)}
                alt={productImages[activeImage]?.texte_alternatif || product.nom}
                className="w-full h-full object-contain"
                onError={() => {
                  if (!triedFallback) setTriedFallback(true);
                  else setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">
                🛍️
              </div>
            )}
          </div>

          {/* Vignettes */}
          {productImages.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {productImages.map((img, i) => (
                <button
                  key={img._id || i}
                  onClick={() => { setActiveImage(i); setTriedFallback(false); setImageError(false); }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === activeImage ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-blue-300"
                  }`}
                  title={img.texte_alternatif || ""}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={img.texte_alternatif || ""}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const fb = getImageUrl(img, true);
                      if (fb && !e.currentTarget.dataset.fb) {
                        e.currentTarget.dataset.fb = "1";
                        e.currentTarget.src = fb;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.nom}</h1>
          {product.reference && (
            <p className="text-sm text-gray-500 mb-4">Réf: {product.reference}</p>
          )}

          {/* Prix */}
          <div className="mb-6">
            {isPromo ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">{formatPrice(product.prixPromotion)}</span>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.prix)}</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  -{Math.round((1 - product.prixPromotion / product.prix) * 100)}%
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-blue-600">{formatPrice(product.prix)}</span>
            )}
          </div>

          {/* Stock & livraison */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              {inStock ? (
                <>
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-green-600 font-medium">
                    En stock ({product.quantiteStock} disponible{product.quantiteStock > 1 ? "s" : ""})
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-red-500" />
                  <span className="text-red-500 font-medium">Rupture de stock</span>
                </>
              )}
            </div>
            {product.delaiLivraison && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>Délai de livraison: {product.delaiLivraison} jour{product.delaiLivraison > 1 ? "s" : ""}</span>
              </div>
            )}
            {product.poids && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package size={16} />
                <span>Poids: {product.poids} kg</span>
              </div>
            )}
          </div>

          {/* Quantité & Ajouter au panier */}
          {inStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition">-</button>
                <span className="px-4 py-3 font-semibold min-w-[50px] text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(product.quantiteStock, qty + 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Ajouter au panier
              </button>
            </div>
          )}

          {/* Description (reste en place) */}
          {product.description && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents techniques */}
      {piecesJointes.length > 0 && (
        <section className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Documents techniques
          </h2>
          <div className="flex flex-wrap gap-3">
            {piecesJointes.map((pj) => (
              <a
                key={pj._id}
                href={getPieceUrl(pj)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 truncate max-w-xs">
                    {pj.nomFichier}
                  </p>
                  <p className="text-xs text-gray-400 uppercase">{pj.type}</p>
                </div>
                <Download size={16} className="text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Produits complémentaires — carousel compact */}
      {compProducts.length > 0 && (
        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Produits complémentaires</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {compProducts.map((p) => (
              <CompactProductCard key={p._id} product={p} images={images} />
            ))}
          </div>
        </section>
      )}

      {/* Informations complémentaires (après les produits complémentaires) */}
      {product.descriptionSupplementaire && (
        <section className="mt-8 border-t border-gray-100 pt-8">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Informations complémentaires :</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-w-3xl">
            {product.descriptionSupplementaire}
          </p>
        </section>
      )}
    </div>
  );
}
