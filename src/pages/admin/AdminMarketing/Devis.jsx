import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDevis, createDevis, getDevisProduits, createDevisProduit } from "../../../api/devis";
import { getProduits } from "../../../api/produits";
import { getUsers } from "../../../api/users";
import { useAuth } from "../../../context/AuthContext";
import { formatPrice } from "../../../utils/formatPrice";
import toast from "react-hot-toast";
import { Plus, Loader2, FileText } from "lucide-react";

const PER_PAGE = 10;

export default function AdminDevis() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [devis, setDevis] = useState([]);
  const [produits, setProduits] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: "", statut: "En attente", notes: "" });
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([getDevis(), getProduits(), getUsers()])
      .then(([dRes, pRes, uRes]) => {
        setDevis(Array.isArray(dRes.data) ? dRes.data : dRes.data?.data || []);
        setProduits(Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || []);
        setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createDevis(form);
      toast.success("Devis créé !");
      setShowForm(false);
      load();
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const getClientName = (clientId) => {
    const u = users.find((u) => u._id === (clientId?._id || clientId));
    return u ? `${u.prenom || ""} ${u.nom || ""}`.trim() || u.email : "—";
  };

  const paginated = devis.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(devis.length / PER_PAGE);

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
          <h2 className="text-xl font-bold text-gray-900">Devis ({devis.length})</h2>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            <Plus size={16} /> Nouveau devis
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Créer un devis</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="">Sélectionner...</option>
                  {users.filter((u) => u.role === "client").map((u) => (
                    <option key={u._id} value={u._id}>{u.prenom} {u.nom} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={form.statut} onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="En attente">En attente</option>
                  <option value="Accepté">Accepté</option>
                  <option value="Refusé">Refusé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-blue-700 transition">Créer</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["ID", "Client", "Statut", "Date"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-mono text-xs">#{(d._id || "").slice(-8)}</td>
                    <td className="px-5 py-4">{getClientName(d.client)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.statut === "Accepté" ? "bg-green-100 text-green-700" : d.statut === "Refusé" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {d.statut || "En attente"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{d.createdAt ? new Date(d.createdAt).toLocaleDateString("fr-FR") : "—"}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">Aucun devis</td></tr>
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
