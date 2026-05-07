import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers } from "../../api/users";
import { getProduits } from "../../api/produits";
import { getCommandes } from "../../api/commandes";
import { getCategories } from "../../api/categories";
import { formatPrice } from "../../utils/formatPrice";
import { useAuth } from "../../context/AuthContext";
import { Users, Package, ShoppingBag, BarChart2, Tag, Loader2, LogOut, ChevronRight } from "lucide-react";

export default function SuperAdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, produits: 0, commandes: 0, revenue: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    Promise.all([getUsers(), getProduits(), getCommandes(), getCategories()])
      .then(([uRes, pRes, cRes, catRes]) => {
        const users = Array.isArray(uRes.data) ? uRes.data : uRes.data?.data || [];
        const produits = Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || [];
        const commandes = Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || [];
        const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];
        const revenue = commandes.reduce((s, c) => s + (parseFloat(c.montantTotal) || 0), 0);
        setStats({ users: users.length, produits: produits.length, commandes: commandes.length, revenue, categories: cats.length });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const menuItems = [
    { key: "dashboard", label: "Tableau de bord", icon: <BarChart2 size={18} /> },
    { key: "users", label: "Utilisateurs", icon: <Users size={18} /> },
    { key: "categories", label: "Catégories", href: "/admin-marketing/categories", icon: <Tag size={18} /> },
    { key: "produits", label: "Produits", href: "/admin-marketing/produits", icon: <Package size={18} /> },
    { key: "commandes", label: "Commandes", icon: <ShoppingBag size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="font-bold text-lg">Super Admin</h1>
          <p className="text-gray-400 text-xs mt-1">ShopTunisie</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { if (item.href) navigate(item.href); else setActiveSection(item.key); }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeSection === item.key ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2 text-xs text-gray-400 mb-3">
            <Link to="/admin-marketing" className="hover:text-white transition">Admin Marketing</Link>
            <ChevronRight size={12} className="self-center" />
            <Link to="/admin-achat" className="hover:text-white transition">Admin Achat</Link>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition w-full">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
        ) : (
          <>
            {activeSection === "dashboard" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tableau de bord</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: "Utilisateurs", value: stats.users, icon: <Users size={22} />, color: "bg-blue-500" },
                    { label: "Produits", value: stats.produits, icon: <Package size={22} />, color: "bg-green-500" },
                    { label: "Commandes", value: stats.commandes, icon: <ShoppingBag size={22} />, color: "bg-purple-500" },
                    { label: "Revenu total", value: formatPrice(stats.revenue), icon: <BarChart2 size={22} />, color: "bg-orange-500" },
                  ].map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
                      <div className={`${card.color} text-white p-3 rounded-xl`}>{card.icon}</div>
                      <div>
                        <p className="text-gray-500 text-sm">{card.label}</p>
                        <p className="font-bold text-xl text-gray-900">{card.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Accès rapide</h3>
                    <div className="space-y-2">
                      <Link to="/admin-marketing" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition text-sm">
                        <span>Dashboard Marketing</span><ChevronRight size={16} />
                      </Link>
                      <Link to="/admin-achat" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition text-sm">
                        <span>Dashboard Achat</span><ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Statistiques</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Catégories</span>
                        <span className="font-semibold">{stats.categories}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Produits</span>
                        <span className="font-semibold">{stats.produits}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Commandes</span>
                        <span className="font-semibold">{stats.commandes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "users" && <UsersSection />}
            {activeSection === "commandes" && <CommandesSection />}
          </>
        )}
      </main>
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    getUsers().then((res) => {
      setUsers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.prenom || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.nom || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Utilisateurs ({users.length})</h2>
        <input type="search" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 w-64" />
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Nom", "Email", "Rôle", "Statut"].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">{u.prenom} {u.nom}</td>
                  <td className="px-5 py-4 text-gray-600">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{u.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.actif === false ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                      {u.actif === false ? "Inactif" : "Actif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommandesSection() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const STATUT_COLORS = { "En attente": "bg-yellow-100 text-yellow-800", "Confirmée": "bg-blue-100 text-blue-800", "Expédiée": "bg-purple-100 text-purple-800", "Livrée": "bg-green-100 text-green-800", "Annulée": "bg-red-100 text-red-800" };

  useEffect(() => {
    getCommandes().then((res) => {
      setCommandes(Array.isArray(res.data) ? res.data : res.data?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = commandes.filter(c => (c._id || "").includes(search));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Commandes ({commandes.length})</h2>
        <input type="search" placeholder="Rechercher par ID..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 w-64" />
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["ID", "Client", "Montant", "Statut", "Date"].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-mono text-xs">#{(c._id || "").slice(-8)}</td>
                  <td className="px-5 py-4">{c.client?.email || c.client || "—"}</td>
                  <td className="px-5 py-4 font-semibold text-blue-600">{formatPrice(c.montantTotal)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[c.statut] || "bg-gray-100 text-gray-700"}`}>{c.statut || "En attente"}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr-FR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
