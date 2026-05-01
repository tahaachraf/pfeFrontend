import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../api/users";
import toast from "react-hot-toast";
import { Loader2, UserPlus, MailCheck } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", motDePasse: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [emailEnvoye, setEmailEnvoye] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prenom || !form.nom || !form.email || !form.motDePasse) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (form.motDePasse !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.motDePasse.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        motDePasse: form.motDePasse,
      });
      setEmailEnvoye(true);
    } catch (err) {
      if (!err.response) {
        // Pas de réponse = backend hors ligne ou crash
        toast.error("Impossible de contacter le serveur (port 3500). Vérifiez que node server.js tourne.", { duration: 6000 });
      } else {
        // Réponse reçue mais erreur HTTP
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data ||
          `Erreur serveur (${err.response.status})`;
        toast.error(typeof msg === "string" ? msg : JSON.stringify(msg), { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailEnvoye) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MailCheck size={40} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Vérifiez votre email</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            Un email d'activation a été envoyé à :
          </p>
          <p className="font-semibold text-blue-700 text-sm mb-6">{form.email}</p>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Cliquez sur le lien <strong>"Activer mon compte"</strong> dans cet email pour finaliser votre inscription.
            Vérifiez aussi vos spams si vous ne le trouvez pas.
          </p>
          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">
              Déjà activé ?{" "}
              <Link to="/connexion" className="text-blue-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600">ShopTunisie</Link>
          <h1 className="text-xl font-semibold text-gray-900 mt-4">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoignez ShopTunisie</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Prénom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Nom"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="motDePasse"
              value={form.motDePasse}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Minimum 6 caractères"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="text-blue-600 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
