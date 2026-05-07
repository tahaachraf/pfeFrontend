import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../../api/categories";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, Save, X, Loader2, Search } from "lucide-react";

const PER_PAGE = 10;

export default function AdminCategories() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: "", slug: "", categorieParent: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCategories()
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: "", slug: "", categorieParent: "" });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat._id);
    setForm({
      nom: cat.nom || "",
      slug: cat.slug || "",
      categorieParent: cat.categorieParent?._id || cat.categorieParent || "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nom) { toast.error("Le nom est requis"); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing, form);
        toast.success("Catégorie mise à jour !");
      } else {
        await createCategory(form);
        toast.success("Catégorie créée !");
      }
      setShowForm(false);
      load();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer "${nom}" ?`)) return;
    try {
      await deleteCategory(id);
      toast.success("Catégorie supprimée");
      load();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getParentName = (catId) =>
    categories.find((c) => c._id === (catId?._id || catId))?.nom;

  const filtered = categories.filter((c) =>
    (c.nom || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700"><h1 className="font-bold text-lg">Admin Marketing</h1></div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: "Dashboard", href: "/admin-marketing" },
            { label: "Produits", href: "/admin-marketing/produits" },
            { label: "Catégories", href: "/admin-marketing/categories" },
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
          <h2 className="text-xl font-bold text-gray-900">Catégories ({categories.length})</h2>
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            <Plus size={16} /> Nouvelle catégorie
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} required className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie parente</label>
                <select value={form.categorieParent} onChange={(e) => setForm((f) => ({ ...f, categorieParent: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="">Aucune (root)</option>
                  {categories.filter((c) => c._id !== editing).map((c) => <option key={c._id} value={c._id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Enregistrement..." : "Enregistrer"}
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
                  {["Nom", "Slug", "Catégorie parente", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-medium text-gray-900">{c.nom}</td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{c.slug || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{getParentName(c.categorieParent) || <span className="text-gray-400">—</span>}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(c._id, c.nom)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">Aucune catégorie</td></tr>
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
