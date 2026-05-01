import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";

export default function CategoryMegaMenu({ tree }) {
  const [open, setOpen] = useState(false);
  const [activeRoot, setActiveRoot] = useState(null);
  const [activeChild, setActiveChild] = useState(null);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setActiveRoot(null);
        setActiveChild(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleRootHover = (root) => {
    setActiveRoot(root);
    setActiveChild(null);
  };

  const handleChildHover = (child) => {
    setActiveChild(child);
  };

  const close = () => {
    setOpen(false);
    setActiveRoot(null);
    setActiveChild(null);
  };

  const handleRootClick = (root) => {
    if (!root.children?.length) {
      navigate(`/categorie/${root.slug || root._id}`);
      close();
    }
  };

  const handleChildClick = (child) => {
    if (!child.children?.length) {
      navigate(`/categorie/${child.slug || child._id}`);
      close();
    }
  };

  const handleGrandClick = (grand) => {
    navigate(`/categorie/${grand.slug || grand._id}`);
    close();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
        Catégories
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 flex shadow-2xl rounded-xl border border-gray-200 overflow-hidden bg-white min-h-[300px]">
          {/* Column 1: Root categories */}
          <div className="w-56 bg-gray-50 border-r border-gray-200 overflow-y-auto max-h-[500px]">
            {tree.map((root) => (
              <button
                key={root._id}
                onMouseEnter={() => handleRootHover(root)}
                onClick={() => handleRootClick(root)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                  activeRoot?._id === root._id
                    ? "bg-blue-600 text-white"
                    : "text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <span className="font-medium">{root.nom}</span>
                {root.children?.length > 0 && (
                  <ChevronRight
                    size={14}
                    className={activeRoot?._id === root._id ? "text-white" : "text-gray-400"}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Column 2: Subcategories of hovered root */}
          {activeRoot?.children?.length > 0 && (
            <div className="w-52 border-r border-gray-200 overflow-y-auto max-h-[500px] bg-white">
              <div className="px-4 py-2 border-b border-gray-100">
                <Link
                  to={`/categorie/${activeRoot.slug || activeRoot._id}`}
                  onClick={close}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Tout — {activeRoot.nom}
                </Link>
              </div>
              {activeRoot.children.map((child) => (
                <button
                  key={child._id}
                  onMouseEnter={() => handleChildHover(child)}
                  onClick={() => handleChildClick(child)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                    activeChild?._id === child._id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <span>{child.nom}</span>
                  {child.children?.length > 0 && (
                    <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Column 3: Sub-subcategories of hovered child */}
          {activeChild?.children?.length > 0 && (
            <div className="w-52 overflow-y-auto max-h-[500px] bg-white">
              <div className="px-4 py-2 border-b border-gray-100">
                <Link
                  to={`/categorie/${activeChild.slug || activeChild._id}`}
                  onClick={close}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Tout — {activeChild.nom}
                </Link>
              </div>
              {activeChild.children.map((grand) => (
                <button
                  key={grand._id}
                  onClick={() => handleGrandClick(grand)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {grand.nom}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
