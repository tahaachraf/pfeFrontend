import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Truck, Package, ShoppingBag } from "lucide-react";

export default function AdminAchatDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { title: "Fournisseurs", description: "Gérer les fournisseurs", icon: <Truck size={24} />, href: "/admin-achat/fournisseurs", color: "bg-teal-500" },
    { title: "Produits-Fournisseurs", description: "Associer produits et fournisseurs", icon: <Package size={24} />, href: "/admin-achat/produits-achat", color: "bg-orange-500" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="font-bold text-lg">Admin Achat</h1>
          <p className="text-gray-400 text-xs mt-1">ShopTunisie</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: "Dashboard", href: "/admin-achat" },
            { label: "Fournisseurs", href: "/admin-achat/fournisseurs" },
            { label: "Produits-Fournisseurs", href: "/admin-achat/produits-achat" },
          ].map((item) => (
            <Link key={item.href} to={item.href} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { logout(); navigate("/"); }} className="text-sm text-gray-400 hover:text-white transition">Déconnexion</button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-8">Dashboard Achat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link key={card.href} to={card.href} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4">
              <div className={`${card.color} text-white p-4 rounded-xl`}>{card.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{card.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
