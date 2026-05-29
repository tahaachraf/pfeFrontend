import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCommandes, getCommandeProduits } from "../../api/commandes";
import { formatPrice } from "../../utils/formatPrice";
import { Loader2, Package, User, Clock, ChevronDown, ChevronUp } from "lucide-react";

const IMAGE_BASE =
  typeof window !== "undefined" && window.location.port === "5173"
    ? "http://localhost:3500/api/uploads/"
    : "/api/uploads/";

const STATUT_COLORS = {
  "En attente": "bg-yellow-100 text-yellow-800",
  "Confirmée":  "bg-blue-100 text-blue-800",
  "Expédiée":   "bg-purple-100 text-purple-800",
  "Livrée":     "bg-green-100 text-green-800",
  "Annulée":    "bg-red-100 text-red-800",
};

export default function MonCompte() {
  const { user } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [commandeProduits, setCommandeProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profil");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Compatible pfe/ (_id) et JWT (id)
  const userId = user?._id || user?.id;

  useEffect(() => {
    Promise.all([getCommandes(), getCommandeProduits()])
      .then(([cmdRes, cpRes]) => {
        const allCmds = Array.isArray(cmdRes.data) ? cmdRes.data : cmdRes.data?.data || [];
        const myCmds = allCmds.filter((c) => {
          const cid = c.clientId?._id || c.clientId;
          return cid === userId && c.statut === "Confirmée";
        });
        setCommandes(myCmds);
        setCommandeProduits(Array.isArray(cpRes.data) ? cpRes.data : cpRes.data?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const getOrderItems = (orderId) =>
    commandeProduits.filter((cp) => {
      const cid = cp.id_commande?._id || cp.id_commande;
      return cid === orderId;
    });

  // Champs affichés — compatible pfe/ (prenom, nom, email, role)
  //                  et JWT     (username, statut)
  const displayFields = [
    { label: "Prénom",    value: user?.prenom                         },
    { label: "Nom",       value: user?.nom                            },
    { label: "Identifiant", value: user?.email || user?.username      },
    { label: "Rôle",      value: user?.role || user?.statut           },
  ].filter((f) => f.value);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon compte</h1>

      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {[
          { key: "profil",    label: "Mon profil",      icon: <User size={16} /> },
          { key: "commandes", label: "Historique des commandes", icon: <Package size={16} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.key === "commandes" && commandes.length > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {commandes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "profil" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayFields.map((field) => (
              <div key={field.label} className="bg-gray-50 rounded-xl px-5 py-4">
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">{field.label}</label>
                <p className="text-gray-900 font-semibold">{field.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "commandes" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={36} />
            </div>
          ) : commandes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-700">Aucune commande confirmée</h3>
              <p className="text-gray-500 text-sm mt-1">Vos commandes payées apparaîtront ici.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commandes.map((cmd) => {
                const orderItems = getOrderItems(cmd._id);
                const isExpanded = expandedOrder === cmd._id;
                return (
                  <div key={cmd._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedOrder(isExpanded ? null : cmd._id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Package size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            Commande #{(cmd._id || "").slice(-8).toUpperCase()}
                          </p>
                          <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            {cmd.dateCommande
                              ? new Date(cmd.dateCommande).toLocaleDateString("fr-FR", {
                                  day: "numeric", month: "long", year: "numeric",
                                })
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[cmd.statut] || "bg-gray-100 text-gray-800"}`}>
                          {cmd.statut || "En attente"}
                        </span>
                        <span className="font-bold text-blue-600">{formatPrice(cmd.total)}</span>
                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5 bg-gray-50">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Articles commandés ({orderItems.length})
                        </h4>
                        {orderItems.length === 0 ? (
                          <p className="text-gray-400 text-sm">Aucun détail disponible</p>
                        ) : (
                          <div className="space-y-3">
                            {orderItems.map((cp, i) => {
                              const produit = cp.id_produit;
                              const nomProduit = produit?.nom || produit?.titreSite || "Produit";
                              const imgProduit = produit?.image;
                              return (
                                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                                  <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                    {imgProduit ? (
                                      <img
                                        src={`${IMAGE_BASE}${encodeURIComponent(imgProduit)}`}
                                        alt={nomProduit}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{nomProduit}</p>
                                    <p className="text-gray-500 text-xs">Qté : {cp.quantite}</p>
                                  </div>
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {formatPrice((cp.prixUnitaire || 0) * cp.quantite)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
