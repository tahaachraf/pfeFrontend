import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/formatPrice";
import { Trash2, ShoppingBag, Plus, Minus, Loader2, UserPlus, LogIn } from "lucide-react";
import toast from "react-hot-toast";

const IMAGE_BASE = "http://localhost:3500/api/uploads/";

function ItemImage({ item }) {
  const src = item.imageUrl ||
    (item.slug_image ? `${IMAGE_BASE}${encodeURIComponent(item.slug_image.normalize("NFC"))}` : null) ||
    (item.image      ? `${IMAGE_BASE}${encodeURIComponent(item.image.normalize("NFC"))}` : null);

  if (src) return <img src={src} alt={item.nom} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />;
  return <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>;
}

// Rôles autorisés à passer commande (pas internaute)
const CAN_CHECKOUT = ["client", "superAdmin", "adminMarketing", "adminAchat"];

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart, syncing, cartLoaded } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAnonymous  = !user;
  const isInternaute = user?.role === "internaute";
  const canCheckout  = user && CAN_CHECKOUT.includes(user.role);

  const handleRemove = async (item) => {
    await removeFromCart(item._id);
    toast.success("Produit retiré du panier");
  };

  const handleClear = async () => {
    await clearCart();
    toast.success("Panier vidé");
  };

  const handleCheckout = () => {
    if (canCheckout) { navigate("/commande"); return; }
    if (isInternaute) {
      toast("Votre rôle ne permet pas le paiement. Contactez l'administrateur.", { icon: "🔒" });
      return;
    }
    toast("Créez un compte pour finaliser votre commande", { icon: "👤" });
    navigate("/inscription");
  };

  if (!cartLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-gray-500">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <span>Chargement du panier…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-7xl">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700">Votre panier est vide</h2>
        <p className="text-gray-500">Découvrez nos produits et commencez vos achats !</p>
        <Link to="/" className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition">
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <ShoppingBag size={24} />
        Mon panier ({items.length} article{items.length > 1 ? "s" : ""})
        {syncing && <Loader2 size={18} className="animate-spin text-blue-500 ml-2" />}
      </h1>

      {canCheckout && (
        <p className="text-sm text-green-600 mb-6">✅ Panier synchronisé avec votre compte</p>
      )}

      {/* Visiteur non connecté */}
      {isAnonymous && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">
              Vous naviguez sans compte
            </p>
            <p className="text-amber-700 text-xs mt-0.5">
              Vous pouvez ajouter des produits au panier, mais vous devez créer un compte pour finaliser votre commande et effectuer le paiement.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to="/inscription" className="flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition">
              <UserPlus size={13} /> S'inscrire
            </Link>
            <Link to="/connexion" className="flex items-center gap-1 border border-gray-300 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition">
              <LogIn size={13} /> Se connecter
            </Link>
          </div>
        </div>
      )}

      {/* Connecté mais rôle internaute */}
      {isInternaute && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-blue-800 text-sm">
              Votre compte ne permet pas le paiement
            </p>
            <p className="text-blue-700 text-xs mt-0.5">
              Votre rôle actuel (internaute) ne vous permet pas de finaliser une commande. Contactez l'administrateur pour activer votre compte client.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
              <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <ItemImage item={item} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.nom}</h3>
                {item.reference && <p className="text-xs text-gray-400 mt-0.5">Réf. {item.reference}</p>}
                <p className="text-blue-600 font-bold mt-1">{formatPrice(item.prix)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={syncing}
                      className="px-2 py-1 hover:bg-gray-50 transition disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={syncing}
                      className="px-2 py-1 hover:bg-gray-50 transition disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={syncing}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">{formatPrice((item.prix || 0) * item.quantity)}</p>
              </div>
            </div>
          ))}
          <button
            onClick={handleClear}
            disabled={syncing}
            className="text-sm text-red-500 hover:underline flex items-center gap-1 mt-2 disabled:opacity-40"
          >
            <Trash2 size={14} /> Vider le panier
          </button>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-gray-600">
                  <span className="truncate flex-1 mr-2">{item.nom} x{item.quantity}</span>
                  <span>{formatPrice((item.prix || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={syncing}
              className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-center hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isAnonymous ? (
                <><UserPlus size={16} /> S'inscrire pour commander</>
              ) : isInternaute ? (
                <><LogIn size={16} /> Compte non autorisé au paiement</>
              ) : (
                "Passer la commande"
              )}
            </button>
            <Link
              to="/"
              className="mt-3 block w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-xl text-center hover:bg-gray-50 transition text-sm"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
