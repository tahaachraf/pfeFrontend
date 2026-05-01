import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">ShopTunisie</h3>
          <p className="text-sm leading-relaxed">
            Votre site e-commerce multi-catégories en Tunisie. High-tech, électroménager, mode et plus encore.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">Accueil</Link></li>
            <li><Link to="/recherche" className="hover:text-white transition">Recherche</Link></li>
            <li><Link to="/panier" className="hover:text-white transition">Panier</Link></li>
            <li><Link to="/mon-compte" className="hover:text-white transition">Mon compte</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Informations</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">À propos</a></li>
            <li><a href="#" className="hover:text-white transition">Conditions d'utilisation</a></li>
            <li><a href="#" className="hover:text-white transition">Politique de confidentialité</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Service client</h4>
          <ul className="space-y-2 text-sm">
            <li>Tél: +216 70 000 000</li>
            <li>Email: contact@shoptunisie.tn</li>
            <li>Lun-Sam: 9h00 - 18h00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ShopTunisie. Tous droits réservés.
      </div>
    </footer>
  );
}
