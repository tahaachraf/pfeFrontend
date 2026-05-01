import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import toast from "react-hot-toast";

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

const matchProduit = (img, productId) => {
  const imgProduitId = img.id_produit?._id || img.id_produit;
  return String(imgProduitId) === String(productId);
};

export default function ProductCard({ product, images = [] }) {
  const { addToCart } = useCart();

  const mainImage =
    images.find((img) => matchProduit(img, product._id) && img.ordreAffichage === 1) ||
    images.find((img) => matchProduit(img, product._id));

  const imageUrl = getImageUrl(mainImage);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({ ...product, imageUrl });
    toast.success(`${product.nom} ajouté au panier !`);
  };

  const isPromo = product.promotion === true;

  return (
    <Link
      to={`/produit/${product.slug || product._id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden flex flex-col"
    >
      <div className="relative overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={mainImage?.texte_alternatif || product.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const fbUrl = getImageUrl(mainImage, true);
              if (fbUrl && !e.currentTarget.dataset.fb) {
                e.currentTarget.dataset.fb = "1";
                e.currentTarget.src = fbUrl;
              } else {
                e.currentTarget.style.display = "none";
                const placeholder = e.currentTarget.nextElementSibling;
                if (placeholder) placeholder.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-gray-300 text-5xl"
          style={{ display: imageUrl ? "none" : "flex" }}
        >
          🛍️
        </div>
        {isPromo && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            PROMO
          </span>
        )}
        {product.quantiteStock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
          {product.nom}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            <span className={`font-bold text-base ${isPromo ? "text-red-600" : "text-blue-600"}`}>
              {formatPrice(product.prix)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.quantiteStock === 0}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title="Ajouter au panier"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
