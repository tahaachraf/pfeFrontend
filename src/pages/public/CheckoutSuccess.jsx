import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { updateCommande } from "../../api/commandes";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const commandeId = searchParams.get("commandeId");

    if (commandeId) {
      updateCommande(commandeId, { statut: "Confirmée" })
        .catch((err) => console.error("Erreur confirmation commande :", err));
    }

    clearCart();
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle size={48} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Paiement accepté !</h2>
      <p className="text-gray-600 text-center max-w-md">
        Votre commande est confirmée. Vous pouvez suivre son état dans votre espace client.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
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
