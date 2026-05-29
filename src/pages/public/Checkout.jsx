import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/formatPrice";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Loader2, CreditCard, ShoppingBag, ChevronRight, ArrowLeft } from "lucide-react";

const IS_LOCAL = window.location.port === "5173";
const IMAGE_BASE = IS_LOCAL ? "http://localhost:3500/api/uploads/" : "/api/uploads/";

function ItemImage({ item }) {
  const src =
    item.imageUrl ||
    (item.slug_image ? `${IMAGE_BASE}${encodeURIComponent(item.slug_image.normalize("NFC"))}` : null) ||
    (item.image      ? `${IMAGE_BASE}${encodeURIComponent(item.image.normalize("NFC"))}` : null);
  if (src)
    return (
      <img src={src} alt={item.nom} className="w-full h-full object-cover"
        onError={(e) => { e.currentTarget.style.display = "none"; }} />
    );
  return <div className="w-full h-full flex items-center justify-center text-xl">📦</div>;
}

export default function Checkout() {
  const { items, total, commandeId, cartLoaded } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!commandeId) {
      toast.error("Commande introuvable.");
      return;
    }
    setLoading(true);
    try {
      // Appel backend → Stripe crée une session de paiement et renvoie l'URL
      const res = await api.post("/create-payment-intent", {
        commandeId,
        amount:     Math.round(total * 100),
        successUrl: `${window.location.origin}/commande/success?commandeId=${commandeId}`,
        cancelUrl:  `${window.location.origin}/commande`,
      });

      const data = res.data;

      // Cas 1 : backend renvoie une URL Stripe Checkout Session → redirection
      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      // Cas 2 : backend renvoie clientSecret (PaymentIntent) → ne pas rediriger
      if (data?.clientSecret) {
        toast.error(
          "Le backend renvoie un clientSecret au lieu d'une URL Stripe. " +
          "Modifiez l'endpoint pour créer une Checkout Session et retourner { url }."
        );
        setLoading(false);
        return;
      }

      // Cas 3 : réponse inattendue
      toast.error("Réponse inattendue du serveur. Vérifiez l'endpoint /create-payment-intent.");
      setLoading(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la connexion au serveur.";
      toast.error(msg);
      setLoading(false);
    }
  };

  if (!cartLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-gray-500">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <span>Chargement…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-7xl">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700">Votre panier est vide</h2>
        <Link to="/" className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition">
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className="font-semibold text-blue-600">1. Récapitulatif</span>
        <ChevronRight size={16} className="text-gray-300" />
        <span className="text-gray-400 font-semibold">2. Paiement Stripe</span>
        <ChevronRight size={16} className="text-gray-300" />
        <span className="text-gray-400 font-semibold">3. Confirmation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Articles */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <ShoppingBag size={18} /> Articles
          </h2>
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                <ItemImage item={item} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.nom}</p>
                <p className="text-gray-500 text-xs mt-0.5">Quantité : {item.quantity}</p>
              </div>
              <p className="font-bold text-gray-900 text-sm">{formatPrice((item.prix || 0) * item.quantity)}</p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Paiement */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-800 text-lg mb-4">Client</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Nom</span>
                <span className="font-medium">{user?.prenom} {user?.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium truncate ml-4">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Bouton paiement Stripe */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2 text-base disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 size={20} className="animate-spin" /> Redirection vers Stripe…</>
            ) : (
              <><CreditCard size={20} /> Payer</>
            )}
          </button>

          {/* Badge sécurité Stripe */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg width="38" height="16" viewBox="0 0 38 16" fill="none">
              <text x="0" y="13" fontSize="13" fontWeight="700" fill="#635BFF" fontFamily="system-ui">stripe</text>
            </svg>
            <span>Paiement 100% sécurisé — vous serez redirigé vers Stripe</span>
          </div>

          <Link to="/panier"
            className="w-full text-center text-sm text-gray-500 hover:text-gray-800 transition py-1 flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Retour au panier
          </Link>
        </div>
      </div>
    </div>
  );
}
