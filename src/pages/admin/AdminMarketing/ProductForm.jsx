import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProduits, createProduit, updateProduit } from "../../../api/produits";
import { getCategories } from "../../../api/categories";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { Loader2, Save, ArrowLeft } from "lucide-react";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nom: "", reference: "", prix: "", cout: "", poids: "",
    quantiteStock: "", delaiLivraison: "", categorie: "",
    description: "", descriptionSupplementaire: "", metaDescription: "",
    statutProduit: "actif",
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCategories(),
      isEdit ? getProduits() : Promise.resolve({ data: [] }),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []);
        if (isEdit) {
          const prods = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || [];
          const prod = prods.find((p) => p._id === id);
          if (prod) {
            setForm({
              nom: prod.nom || "",
              reference: prod.reference || "",
              prix: prod.prix || "",
              cout: prod.cout || "",
              poids: prod.poids || "",
              quantiteStock: prod.quantiteStock || "",
              delaiLivraison: prod.delaiLivraison || "",
              categorie: prod.categorie?._id || prod.categorie || "",
              description: prod.description || "",
              descriptionSupplementaire: prod.descriptionSupplementaire || "",
              metaDescription: prod.metaDescription || "",
              statutProduit: prod.statutProduit || "actif",
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prix) {
      toast.error("Le nom et le prix sont requis");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateProduit(id, form);
        toast.success("Produit mis à jour !");
      } else {
        await createProduit(form);
        toast.success("Produit créé !");
      }
      navigate("/admin-marketing/produits");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={36} /></div>;

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
            <Link key={item.href} to={item.href} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition">{item.label}</Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { logout(); navigate("/"); }} className="text-sm text-gray-400 hover:text-white transition">Déconnexion</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin-marketing/produits" className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm transition">
            <ArrowLeft size={16} /> Retour
          </Link>
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Modifier le produit" : "Nouveau produit"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
              <input name="nom" value={form.nom} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input name="reference" value={form.reference} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DT) *</label>
              <input name="prix" type="number" step="0.001" value={form.prix} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coût (DT)</label>
              <input name="cout" type="number" step="0.001" value={form.cout} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
              <input name="poids" type="number" step="0.01" value={form.poids} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité en stock</label>
              <input name="quantiteStock" type="number" value={form.quantiteStock} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Délai de livraison</label>
              <input name="delaiLivraison" value={form.delaiLivraison} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" placeholder="ex: 3-5 jours" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select name="categorie" value={form.categorie} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500">
                <option value="">Sélectionner...</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select name="statutProduit" value={form.statutProduit} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500">
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description supplémentaire</label>
              <textarea name="descriptionSupplementaire" value={form.descriptionSupplementaire} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta description</label>
              <input name="metaDescription" value={form.metaDescription} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <Link to="/admin-marketing/produits" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Annuler</Link>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
