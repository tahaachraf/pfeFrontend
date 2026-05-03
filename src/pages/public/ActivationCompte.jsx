import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { activerCompte } from "../../api/users";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function ActivationCompte() {
  const { token } = useParams();
  const [statut, setStatut] = useState("chargement");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatut("erreur");
      setMessage("Lien d'activation invalide.");
      return;
    }
    activerCompte(token)
      .then((res) => {
        setStatut("succes");
        setMessage(res.data?.message || "Votre compte a été activé avec succès !");
      })
      .catch((err) => {
        setStatut("erreur");
        const msg = err.response?.data?.message || "";
        if (msg.toLowerCase().includes("expiré") || msg.toLowerCase().includes("expire")) {
          setMessage("Ce lien d'activation a expiré. Veuillez vous réinscrire.");
        } else if (msg.toLowerCase().includes("déjà") || msg.toLowerCase().includes("deja")) {
          setMessage("Ce compte est déjà activé. Vous pouvez vous connecter.");
          setStatut("dejActif");
        } else {
          setMessage(msg || "Lien d'activation invalide ou expiré.");
        }
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
        {statut === "chargement" && (
          <>
            <Loader2 size={52} className="animate-spin text-blue-500 mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Activation en cours...</h1>
            <p className="text-gray-500 text-sm">Veuillez patienter quelques instants.</p>
          </>
        )}

        {statut === "succes" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Compte activé !</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">{message}</p>
            <Link
              to="/connexion"
              className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Se connecter
            </Link>
          </>
        )}

        {(statut === "erreur" || statut === "dejActif") && (
          <>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              statut === "dejActif" ? "bg-blue-100" : "bg-red-100"
            }`}>
              {statut === "dejActif"
                ? <CheckCircle size={48} className="text-blue-500" />
                : <XCircle size={48} className="text-red-500" />
              }
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {statut === "dejActif" ? "Compte déjà activé" : "Activation échouée"}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/connexion"
                className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Se connecter
              </Link>
              {statut === "erreur" && (
                <Link
                  to="/inscription"
                  className="inline-block border border-gray-300 text-gray-700 font-medium px-8 py-3 rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  Créer un nouveau compte
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
