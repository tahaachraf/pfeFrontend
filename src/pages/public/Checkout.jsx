import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createCommande, createCommandeProduit } from "../../api/commandes";
import { formatPrice } from "../../utils/formatPrice";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, ShoppingBag, Lock } from "lucide-react";

const IMAGE_BASE = "http://localhost:3500/api/uploads/";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour passer une commande");
      navigate("/connexion");
      return;
    }
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    setLoading(true);
    try {
      const commandeRes = await createCommande({
        clientId: user._id || user.id,
        total: total,
        statut: "En attente",
      });

      const commandeId = commandeRes.data?._id || commandeRes.data?.id;

      if (commandeId) {
        await Promise.all(
          items.map((item) =>
            createCommandeProduit({
              id_commande: commandeId,
              id_produit: item._id,
              quantite: item.quantity,
              prixUnitaire: item.prix,
            })
          )
        );
      }

      clearCart();
      setSuccess(true);
      toast.success("Commande passée avec succès !");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Commande enregistrée !</h2>
        <p className="text-gray-600 text-center max-w-md">
          Votre commande est en attente de traitement. Vous pouvez suivre son état dans votre espace client.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/mon-compte")}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Mes commandes
          </button>
          <button
            onClick={() => navigate("/")}
            className="border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Retour à l'accueil
          </button>
        </div>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <ShoppingBag size={24} />
        Récapitulatif de la commande
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-lg mb-2">Articles</h2>
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.nom} className="w-full h-full object-cover" />
                ) : item.image ? (
                  <img src={`${IMAGE_BASE}${encodeURIComponent(item.image)}`} alt={item.nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                )}
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
                <span className="font-medium">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Lock size={14} />
              Paiement en cours de déploiement
            </div>
            <p className="text-amber-700 text-xs">
              Le paiement en ligne sera disponible prochainement. Votre commande sera enregistrée avec le statut "En attente".
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60 text-base"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? "Enregistrement..." : "Confirmer la commande"}
          </button>

          <Link
            to="/panier"
            className="w-full text-center text-sm text-gray-500 hover:text-gray-800 transition py-2"
          >
            ← Retour au panier
          </Link>
        </div>
      </div>
    </div>
  );
}
