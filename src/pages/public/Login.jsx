import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/users";
import toast from "react-hot-toast";
import { Loader2, LogIn, MailWarning } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [compteNonActive, setCompteNonActive] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !motDePasse) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setCompteNonActive(false);
    setLoading(true);
    try {
      const res = await loginUser(email, motDePasse);
      let userData = res.data;

      // Backend pfe/    → { _id, nom, prenom, email, role }
      // Backend JWT     → { token, user: { id, username, statut } }
      if (userData.token && userData.user) {
        userData = { ...userData.user, token: userData.token };
      }

      const hasId = userData._id || userData.id;
      if (!hasId) throw new Error("Réponse invalide du serveur");

      login(userData);

      const name = userData.prenom || userData.username || userData.nom || "vous";
      toast.success(`Bienvenue, ${name} !`);

      const role = userData.role || userData.statut || "";
      if (role === "superAdmin" || role === "Admin") navigate("/super-admin");
      else if (role === "adminMarketing") navigate("/admin-marketing");
      else if (role === "adminAchat") navigate("/admin-achat");
      else navigate("/mon-compte");

    } catch (err) {
      const msg = err.response?.data?.message || "";
      const isNonActive =
        msg.toLowerCase().includes("activé") ||
        msg.toLowerCase().includes("active") ||
        msg.toLowerCase().includes("cours") ||
        msg.toLowerCase().includes("attente") ||
        err.response?.status === 403;

      if (isNonActive) {
        setCompteNonActive(true);
      } else {
        toast.error(msg || "Email ou mot de passe incorrect");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600">ShopTunisie</Link>
          <h1 className="text-xl font-semibold text-gray-900 mt-4">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        {compteNonActive && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <MailWarning size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Compte non activé</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Votre compte est en attente d'activation. Consultez votre boîte mail et cliquez sur le lien{" "}
                <strong>"Activer mon compte"</strong>. Vérifiez aussi vos spams.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-blue-600 hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
