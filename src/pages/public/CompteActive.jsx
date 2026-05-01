import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export default function CompteActive() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const encoded = searchParams.get("u");

    if (!encoded) {
      setStatus("notoken");
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(encoded));

      // Compatible avec les deux backends :
      // pfe/  → { _id, nom, prenom, email, role }
      // JWT   → { id, username, statut, token }
      const hasValidId = userData._id || userData.id;
      if (!hasValidId) {
        throw new Error("Données invalides");
      }

      login(userData);
      setStatus("success");

      const timer = setTimeout(() => {
        navigate("/mon-compte", { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    } catch {
      setStatus("error");
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Compte activé !</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Votre compte a été activé avec succès. Redirection vers votre espace personnel…
          </p>
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Lien invalide</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Ce lien d'activation est invalide ou a expiré.
          </p>
          <button
            onClick={() => navigate("/connexion")}
            className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Compte activé !</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.
        </p>
        <button
          onClick={() => navigate("/connexion")}
          className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
