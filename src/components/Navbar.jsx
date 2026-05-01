import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, LogOut, Settings, Package, ChevronRight, ChevronLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../api/categories";
import { buildTree } from "../utils/categoryTree";
import CategoryMegaMenu from "./CategoryMegaMenu";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryTree, setCategoryTree] = useState([]);

  // Mobile category drill-down
  const [mobileStep, setMobileStep] = useState("root"); // "root" | "sub" | "grand"
  const [mobileRoot, setMobileRoot] = useState(null);
  const [mobileChild, setMobileChild] = useState(null);

  useEffect(() => {
    getCategories()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCategoryTree(buildTree(data));
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileStep("root");
    setMobileRoot(null);
    setMobileChild(null);
  };

  const adminPath =
    user?.role === "superAdmin"
      ? "/superadmin"
      : user?.role === "adminMarketing"
      ? "/admin-marketing"
      : user?.role === "adminAchat"
      ? "/admin-achat"
      : null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 h-16">
          {/* Desktop category hamburger menu */}
          <div className="hidden md:flex flex-shrink-0">
            <CategoryMegaMenu tree={categoryTree} />
          </div>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" onClick={closeMobile}>
            <span className="text-xl font-bold text-blue-600">ShopTunisie</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-full focus-within:border-blue-500 transition">
              <input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 text-sm outline-none flex-1 w-0"
              />
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition">
                <Search size={16} />
              </button>
            </div>
          </form>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <Link
              to="/panier"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition"
              onClick={closeMobile}
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition p-2"
                >
                  <User size={20} />
                  <span className="hidden md:inline">{user?.prenom || user?.email}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[180px] p-2">
                    <Link
                      to="/mon-compte"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                    >
                      <Package size={16} />
                      Mon compte
                    </Link>
                    {adminPath && (
                      <Link
                        to={adminPath}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                      >
                        <Settings size={16} />
                        Administration
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/connexion"
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition p-2"
              >
                <User size={20} />
                <span className="hidden md:inline">Connexion</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => { setMobileOpen((v) => !v); setMobileStep("root"); }}
              className="p-2 text-gray-700 md:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 pb-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-lg overflow-hidden mt-3 mb-2">
              <input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 text-sm outline-none flex-1"
              />
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white">
                <Search size={16} />
              </button>
            </form>

            {/* Mobile category drill-down */}
            {mobileStep === "root" && (
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2 tracking-wide">Catégories</p>
                {categoryTree.map((root) => (
                  <button
                    key={root._id}
                    onClick={() => {
                      if (root.children?.length) {
                        setMobileRoot(root);
                        setMobileStep("sub");
                      } else {
                        navigate(`/categorie/${root.slug || root._id}`);
                        closeMobile();
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                  >
                    <span>{root.nom}</span>
                    {root.children?.length > 0 && <ChevronRight size={15} className="text-gray-400" />}
                  </button>
                ))}
              </div>
            )}

            {mobileStep === "sub" && mobileRoot && (
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    onClick={() => { setMobileStep("root"); setMobileRoot(null); }}
                    className="text-gray-400 hover:text-blue-600 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold text-gray-800">{mobileRoot.nom}</span>
                </div>
                <Link
                  to={`/categorie/${mobileRoot.slug || mobileRoot._id}`}
                  onClick={closeMobile}
                  className="block px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
                >
                  Voir tout — {mobileRoot.nom}
                </Link>
                {mobileRoot.children.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => {
                      if (child.children?.length) {
                        setMobileChild(child);
                        setMobileStep("grand");
                      } else {
                        navigate(`/categorie/${child.slug || child._id}`);
                        closeMobile();
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                  >
                    <span>{child.nom}</span>
                    {child.children?.length > 0 && <ChevronRight size={15} className="text-gray-400" />}
                  </button>
                ))}
              </div>
            )}

            {mobileStep === "grand" && mobileChild && (
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    onClick={() => { setMobileStep("sub"); setMobileChild(null); }}
                    className="text-gray-400 hover:text-blue-600 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold text-gray-800">{mobileChild.nom}</span>
                </div>
                <Link
                  to={`/categorie/${mobileChild.slug || mobileChild._id}`}
                  onClick={closeMobile}
                  className="block px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
                >
                  Voir tout — {mobileChild.nom}
                </Link>
                {mobileChild.children.map((grand) => (
                  <Link
                    key={grand._id}
                    to={`/categorie/${grand.slug || grand._id}`}
                    onClick={closeMobile}
                    className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                  >
                    {grand.nom}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
