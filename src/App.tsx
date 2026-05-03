import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/public/Home";
import CategoryPage from "./pages/public/CategoryPage";
import ProductDetail from "./pages/public/ProductDetail";
import SearchResults from "./pages/public/SearchResults";
import Cart from "./pages/public/Cart";
import Checkout from "./pages/public/Checkout";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import MonCompte from "./pages/public/MonCompte";
import CompteActive from "./pages/public/CompteActive";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: "12px", fontSize: "14px" },
            }}
          />
          <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/categorie/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
            <Route path="/produit/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/recherche" element={<PublicLayout><SearchResults /></PublicLayout>} />
            <Route path="/panier" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/compte-active" element={<CompteActive />} />

            <Route
              path="/commande"
              element={
                <PrivateRoute roles={["client", "superAdmin"]}>
                  <PublicLayout><Checkout /></PublicLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/mon-compte"
              element={
                <PrivateRoute roles={["client", "superAdmin", "adminMarketing", "adminAchat"]}>
                  <PublicLayout><MonCompte /></PublicLayout>
                </PrivateRoute>
              }
            />

            <Route path="*" element={<PublicLayout><div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><h1 className="text-2xl font-bold text-gray-800">Page introuvable</h1><a href="/" className="text-blue-600 hover:underline">Retour à l'accueil</a></div></PublicLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
