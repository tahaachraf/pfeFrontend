import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../api/categories";
import { getProduits, getImagesProduits } from "../../api/produits";
import { getMarques } from "../../api/marques";
import { buildTree } from "../../utils/categoryTree";
import ProductCard from "../../components/ProductCard";
import { Loader2, ArrowRight, Tag, Truck, Shield, Headphones, ChevronLeft, ChevronRight } from "lucide-react";

const IMAGE_BASE = "http://localhost:3500/api/uploads/";

function BrandsCarousel({ marques }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
    }
  };

  if (!marques.length) return null;

  return (
    <section className="bg-gray-50 py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Nos marques</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="p-2 rounded-full border border-gray-300 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="p-2 rounded-full border border-gray-300 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {marques.map((marque) => (
            <Link
              key={marque._id}
              to={`/recherche?marque=${marque._id}`}
              className="flex-shrink-0 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col items-center justify-center gap-3 w-44"
            >
              {marque.logo ? (
                <img
                  src={IMAGE_BASE + encodeURIComponent(marque.logo)}
                  alt={marque.nom}
                  className="h-14 w-auto object-contain"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                />
              ) : null}
              <div
                className={`h-14 w-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 items-center justify-center text-blue-600 font-bold text-xl ${marque.logo ? "hidden" : "flex"}`}
              >
                {marque.nom.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700 text-center leading-tight">
                {marque.nom}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [produits, setProduits] = useState([]);
  const [images, setImages] = useState([]);
  const [marques, setMarques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(), getProduits(), getImagesProduits(), getMarques()])
      .then(([catRes, prodRes, imgRes, marqRes]) => {
        const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];
        const prods = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || [];
        const imgs = Array.isArray(imgRes.data) ? imgRes.data : imgRes.data?.data || [];
        const marqs = Array.isArray(marqRes.data) ? marqRes.data : [];
        setCategories(cats);
        setProduits(prods);
        setImages(imgs);
        setMarques(marqs);
      })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  }, []);

  const rootCategories = categories.filter(
    (c) => !c.categorieParent || c.categorieParent === null
  ).slice(0, 8);

  // Accepte les statuts : "Active" (nouveau schéma), "actif" (ancienne DB), "EnCours" (défaut)
  const isVisible = (p) => {
    const s = p.statutProduit;
    if (!s) return true;
    return s === "Active" || s === "actif" || s === "EnCours";
  };

  const featuredProducts = produits.filter(isVisible).slice(0, 8);
  const promoProducts = produits.filter((p) => p.promotion === true).slice(0, 4);

  const catColors = [
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700",
    "from-green-500 to-green-700",
    "from-orange-400 to-orange-600",
    "from-pink-500 to-pink-700",
    "from-teal-500 to-teal-700",
    "from-indigo-500 to-indigo-700",
    "from-red-500 to-red-700",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-red-700">Impossible de contacter le serveur backend</h2>
        <p className="text-gray-600">Assurez-vous que le backend tourne sur <strong>http://localhost:3500</strong></p>
        <p className="text-gray-500 text-sm">Dans le dossier <code className="bg-gray-100 px-1 rounded">pfe/</code>, lancez : <code className="bg-gray-100 px-1 rounded">node server.js</code></p>
        <button onClick={() => window.location.reload()} className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition text-sm">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Bienvenue sur <br />
              <span className="text-yellow-300">ShopTunisie</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Découvrez des milliers de produits high-tech, électroménager, mode et bien plus encore.
              Livraison rapide partout en Tunisie.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                to="/recherche"
                className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-yellow-300 transition"
              >
                Découvrir les produits
              </Link>
            </div>
          </div>
          <div className="flex-1 hidden md:flex justify-end">
            <div className="grid grid-cols-2 gap-3 opacity-80">
              {["📱", "💻", "🛒", "👗"].map((emoji, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-8 text-4xl flex items-center justify-center">
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature badges */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck size={20} />, text: "Livraison rapide" },
            { icon: <Shield size={20} />, text: "Achat sécurisé" },
            { icon: <Tag size={20} />, text: "Meilleurs prix" },
            { icon: <Headphones size={20} />, text: "Support 24/7" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <span className="text-blue-600">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {rootCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Nos catégories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {rootCategories.map((cat, i) => (
              <Link
                key={cat._id}
                to={`/categorie/${cat.slug || cat._id}`}
                className={`bg-gradient-to-br ${catColors[i % catColors.length]} text-white rounded-2xl p-6 flex flex-col items-center gap-2 hover:scale-105 transition-transform shadow-md`}
              >
                <span className="text-3xl">🛍️</span>
                <span className="font-semibold text-center text-sm">{cat.nom}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brands Carousel */}
      <BrandsCarousel marques={marques} />

      {/* Promotions */}
      {promoProducts.length > 0 && (
        <section className="bg-red-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                🔥 Promotions en cours
              </h2>
              <Link to="/recherche?promo=1" className="text-red-600 hover:underline text-sm font-medium flex items-center gap-1">
                Tout voir <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {promoProducts.map((p) => (
                <ProductCard key={p._id} product={p} images={images} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Nouveautés</h2>
            <Link to="/recherche" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} images={images} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {featuredProducts.length === 0 && promoProducts.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {produits.length > 0
              ? "Aucun produit actif trouvé"
              : "Aucun produit disponible"}
          </h2>
          <p className="text-gray-500 text-sm">
            {produits.length > 0
              ? `${produits.length} produit(s) en base — statuts trouvés : ${[...new Set(produits.map(p=>p.statutProduit||"(vide)"))].join(", ")}`
              : "La base de données est vide ou le serveur backend ne répond pas"}
          </p>
          <Link to="/recherche" className="inline-block mt-4 text-blue-600 hover:underline text-sm">
            Voir tous les produits quand même →
          </Link>
        </section>
      )}
    </div>
  );
}
