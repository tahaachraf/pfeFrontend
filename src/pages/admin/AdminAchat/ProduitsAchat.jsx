import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProduitsFournisseurs, createProduitFournisseur, getFournisseurs } from "../../../api/fournisseurs";
import { getProduits } from "../../../api/produits";
import { useAuth } from "../../../context/AuthContext";
import { formatPrice } from "../../../utils/formatPrice";
import toast from "react-hot-toast";
import { Plus, Loader2, Save, X, Search } from "lucide-react";

const PER_PAGE = 10;

export default function AdminProduitsAchat() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [produitsFournisseurs, setProduitsFournisseurs] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ produit: "", fournisseur: "", reference_fournisseur: "", prix_achat: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([getProduitsFournisseurs(), getFournisseurs(), getProduits()])
      .then(([pfRes, fRes, pRes]) => {
        setProduitsFournisseurs(Array.isArray(pfRes.data) ? pfRes.data : pfRes.data?.data || []);
        setFournisseurs(Array.isArray(fRes.data) ? fRes.data : fRes.data?.data || []);
        setProduits(Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.produit || !form.fournisseur) { toast.error("Produit et fournisseur requis"); return; }
    setSaving(true);
    try {
      await createProduitFournisseur(form);
      toast.success("Association créée !");
      setShowForm(false);
      load();
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const getProduitName = (id) => produits.find((p) => p._id === (id?._id || id))?.nom || "—";
  const getFournisseurName = (id) => fournisseurs.find((f) => f._id === (id?._id || id))?.nom || "—";

  const filtered = produitsFournisseurs.filter((pf) =>
    getProduitName(pf.produit).toLowerCase().includes(search.toLowerCase()) ||
    getFournisseurName(pf.fournisseur).toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700"><h1 className="font-bold text-lg">Admin Achat</h1></div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: "Dashboard", href: "/admin-achat" },
            { label: "Fournisseurs", href: "/admin-achat/fournisseurs" },
            { label: "Produits-Fournisseurs", href: "/admin-achat/produits-achat" },
          ].map((item) => (
            <Link key={item.href} to={item.href} className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${window.location.pathname === item.href ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}>{item.label}</Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { logout(); navigate("/"); }} className="text-sm text-gray-400 hover:text-white transition">Déconnexion</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Produits-Fournisseurs</h2>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            <Plus size={16} /> Nouvelle association
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Associer produit/fournisseur</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                <select value={form.produit} onChange={(e) => setForm((f) => ({ ...f, produit: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="">Sélectionner...</option>
                  {produits.map((p) => <option key={p._id} value={p._id}>{p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
                <select value={form.fournisseur} onChange={(e) => setForm((f) => ({ ...f, fournisseur: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="">Sélectionner...</option>
                  {fournisseurs.map((f) => <option key={f._id} value={f._id}>{f.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Réf. fournisseur</label>
                <input value={form.reference_fournisseur} onChange={(e) => setForm((f) => ({ ...f, reference_fournisseur: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat (DT)</label>
                <input type="number" step="0.001" value={form.prix_achat} onChange={(e) => setForm((f) => ({ ...f, prix_achat: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Enregistrement..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 bg-white flex-1 max-w-sm">
            <Search size={16} className="text-gray-400" />
            <input type="search" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none text-sm flex-1" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Produit", "Fournisseur", "Réf. fournisseur", "Prix d'achat"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((pf) => (
                  <tr key={pf._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-medium">{getProduitName(pf.produit)}</td>
                    <td className="px-5 py-4 text-gray-600">{getFournisseurName(pf.fournisseur)}</td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{pf.reference_fournisseur || "—"}</td>
                    <td className="px-5 py-4 text-blue-600 font-semibold">{pf.prix_achat ? formatPrice(pf.prix_achat) : "—"}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">Aucune association</td></tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
