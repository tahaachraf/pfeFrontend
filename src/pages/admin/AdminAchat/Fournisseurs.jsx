import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFournisseurs, createFournisseur } from "../../../api/fournisseurs";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Loader2, Search, Save, X } from "lucide-react";

const PER_PAGE = 10;

export default function AdminFournisseurs() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", tel: "", email: "", siteWeb: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getFournisseurs()
      .then((res) => setFournisseurs(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nom) { toast.error("Le nom est requis"); return; }
    setSaving(true);
    try {
      await createFournisseur(form);
      toast.success("Fournisseur créé !");
      setShowForm(false);
      setForm({ nom: "", tel: "", email: "", siteWeb: "" });
      load();
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const filtered = fournisseurs.filter((f) =>
    (f.nom || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.email || "").toLowerCase().includes(search.toLowerCase())
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
          <h2 className="text-xl font-bold text-gray-900">Fournisseurs ({fournisseurs.length})</h2>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            <Plus size={16} /> Nouveau fournisseur
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Nouveau fournisseur</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} required className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input value={form.tel} onChange={(e) => setForm((f) => ({ ...f, tel: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                <input value={form.siteWeb} onChange={(e) => setForm((f) => ({ ...f, siteWeb: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" placeholder="https://..." />
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
                  {["Nom", "Téléphone", "Email", "Site web"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-medium text-gray-900">{f.nom}</td>
                    <td className="px-5 py-4 text-gray-600">{f.tel || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{f.email || "—"}</td>
                    <td className="px-5 py-4">
                      {f.siteWeb ? <a href={f.siteWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{f.siteWeb}</a> : "—"}
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">Aucun fournisseur</td></tr>
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
