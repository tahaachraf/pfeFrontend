import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProduits, deleteProduit } from "../../../api/produits";
import { getCategories } from "../../../api/categories";
import { formatPrice } from "../../../utils/formatPrice";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, Search, Loader2 } from "lucide-react";

const PER_PAGE = 10;

export default function AdminProducts() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([getProduits(), getCategories()])
      .then(([pRes, cRes]) => {
        setProduits(Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || []);
        setCategories(Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer "${nom}" ?`)) return;
    try {
      await deleteProduit(id);
      toast.success("Produit supprimé");
      load();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getCatName = (catId) =>
    categories.find((c) => c._id === (catId?._id || catId))?.nom || "—";

  const filtered = produits.filter((p) =>
    (p.nom || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.reference || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="font-bold text-lg">Admin Marketing</h1>
        </div>
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
          <h2 className="text-xl font-bold text-gray-900">Produits ({produits.length})</h2>
          <Link to="/admin-marketing/produits/nouveau" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            <Plus size={16} /> Nouveau produit
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 bg-white flex-1 max-w-sm">
            <Search size={16} className="text-gray-400" />
            <input type="search" placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none text-sm flex-1" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Nom", "Référence", "Catégorie", "Prix", "Stock", "Statut", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-medium text-gray-900 max-w-[200px] truncate">{p.nom}</td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{p.reference || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{getCatName(p.categorie)}</td>
                    <td className="px-5 py-4 font-semibold text-blue-600">{formatPrice(p.prix)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.quantiteStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.quantiteStock || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.statutProduit === "actif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.statutProduit || "inactif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin-marketing/produits/${p._id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(p._id, p.nom)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Aucun produit trouvé</td></tr>
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
