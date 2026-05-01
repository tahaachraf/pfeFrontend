import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";

const IMAGE_BASE = "http://localhost:3500/api/uploads/";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  const handleRemove = (item) => {
    removeFromCart(item._id);
    toast.success("Produit retiré du panier");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-7xl">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700">Votre panier est vide</h2>
        <p className="text-gray-500">Découvrez nos produits et commencez vos achats !</p>
        <Link to="/" className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition">
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <ShoppingBag size={24} />
        Mon panier ({items.length} article{items.length > 1 ? "s" : ""})
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
              <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.nom} className="w-full h-full object-cover" />
                ) : item.image ? (
                  <img src={`${IMAGE_BASE}${encodeURIComponent(item.image)}`} alt={item.nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.nom}</h3>
                <p className="text-blue-600 font-bold mt-1">{formatPrice(item.prix)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50 transition"><Minus size={14} /></button>
                    <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50 transition"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => handleRemove(item)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">{formatPrice((item.prix || 0) * item.quantity)}</p>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-500 hover:underline flex items-center gap-1 mt-2">
            <Trash2 size={14} /> Vider le panier
          </button>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-gray-600">
                  <span className="truncate flex-1 mr-2">{item.nom} x{item.quantity}</span>
                  <span>{formatPrice((item.prix || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              to="/commande"
              className="mt-6 block w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-center hover:bg-blue-700 transition"
            >
              Passer la commande
            </Link>
            <Link
              to="/"
              className="mt-3 block w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-xl text-center hover:bg-gray-50 transition text-sm"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
