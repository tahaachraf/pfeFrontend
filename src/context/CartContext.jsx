import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  getCommandes, createCommande, updateCommande, deleteCommande,
  getCommandeProduits, createCommandeProduit, updateCommandeProduit, deleteCommandeProduit,
} from "../api/commandes";
import api from "../api/axios";

const CartContext = createContext(null);

const IMAGE_BASE   = "http://localhost:3500/api/uploads/";
const GUEST_CMD_KEY = "guestCommandeId"; // clé localStorage pour visiteurs anonymes

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildImageUrl(img) {
  if (!img) return null;
  const fn = (img.slug_image || img.image || "").normalize("NFC");
  return fn ? `${IMAGE_BASE}${encodeURIComponent(fn)}` : null;
}

function buildItemsAndMap(myCP, allImages) {
  const newCpMap = {};
  const newItems = myCP.map((cp) => {
    const produit   = cp.id_produit || {};
    const produitId = String(produit._id || cp.id_produit || "");

    newCpMap[produitId] = { cpId: cp._id, quantite: cp.quantite, prixUnitaire: cp.prixUnitaire };

    const imgs = (allImages || [])
      .filter((img) => String(img.id_produit?._id || img.id_produit) === produitId)
      .sort((a, b) => (a.ordreAffichage || 0) - (b.ordreAffichage || 0));

    return {
      _id:        produitId,
      nom:        produit.nom        || "",
      prix:       cp.prixUnitaire,
      reference:  produit.reference  || "",
      slug:       produit.slug       || "",
      quantity:   cp.quantite,
      imageUrl:   buildImageUrl(imgs[0] || null),
      slug_image: imgs[0]?.slug_image || "",
      image:      imgs[0]?.image      || "",
    };
  });
  return { newItems, newCpMap };
}

// Récupère le compte internaute partagé (nom/email null) pour les visiteurs anonymes
async function fetchAnonInternauteId() {
  try {
    const res  = await api.get("/users");
    const anon = (res.data || []).find((u) => u.role === "internaute" && !u.email && !u.nom);
    return anon?._id || null;
  } catch { return null; }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }) {
  const { user } = useAuth();

  const [items,      setItems]      = useState([]);
  const [commandeId, setCommandeId] = useState(null);
  const [cpMap,      setCpMap]      = useState({});
  const [syncing,    setSyncing]    = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  const userId = user?._id || user?.id;

  // ── Chargement du panier ───────────────────────────────────────────────────
  const loadCart = useCallback(async () => {
    setCartLoaded(false);
    const guestCmdId = localStorage.getItem(GUEST_CMD_KEY);

    try {
      const [commandesRes, cpRes, imgRes] = await Promise.all([
        getCommandes(),
        getCommandeProduits(),
        api.get("/images-produits"),
      ]);
      const allCommandes = commandesRes.data || [];
      const allCPs       = cpRes.data       || [];
      const allImages    = imgRes.data       || [];

      // Trouver la commande "En attente" de cet utilisateur
      let pending = null;

      if (userId && guestCmdId) {
        // L'utilisateur vient de se connecter après avoir eu un panier visiteur.
        // On retrouve la commande exacte par son ID (plus fiable que par clientId
        // car plusieurs visiteurs peuvent partager le même compte internaute anonyme).
        pending = allCommandes.find((c) => String(c._id) === guestCmdId);

        if (pending) {
          // Si le backend a créé un NOUVEAU userId (≠ internaute _id), on migre le clientId
          const existingCid = String(pending.clientId?._id || pending.clientId || "");
          if (existingCid !== String(userId)) {
            try { await updateCommande(guestCmdId, { clientId: userId }); } catch (_) {}
          }
        }
        localStorage.removeItem(GUEST_CMD_KEY);
      }

      if (!pending && userId) {
        // Pas de panier visiteur : chercher la commande en attente du client connecté
        pending = allCommandes.find((c) => {
          const cid = c.clientId?._id || c.clientId;
          return String(cid) === String(userId) && c.statut === "En attente";
        });
      }

      if (!pending && !userId && guestCmdId) {
        // Visiteur anonyme : retrouver sa commande par son ID exact
        pending = allCommandes.find((c) => String(c._id) === guestCmdId);
      }

      if (!pending) {
        setItems([]); setCommandeId(null); setCpMap({});
        setCartLoaded(true);
        return;
      }

      setCommandeId(pending._id);

      const myCP = allCPs.filter((cp) => {
        const cid = cp.id_commande?._id || cp.id_commande;
        return String(cid) === String(pending._id);
      });

      const { newItems, newCpMap } = buildItemsAndMap(myCP, allImages);
      setItems(newItems);
      setCpMap(newCpMap);

    } catch (err) {
      console.error("Erreur chargement panier:", err);
      setItems([]); setCommandeId(null); setCpMap({});
    } finally {
      setCartLoaded(true);
    }
  }, [userId]);

  useEffect(() => { loadCart(); }, [loadCart]);

  // ── Utilitaires ───────────────────────────────────────────────────────────
  const calcTotal = (list) => list.reduce((s, i) => s + (i.prix || 0) * i.quantity, 0);

  // Crée la commande en DB si elle n'existe pas encore (visiteur ou client)
  const ensureCommande = async () => {
    if (commandeId) return commandeId;

    const clientId = userId || (await fetchAnonInternauteId());
    if (!clientId) throw new Error("Impossible d'identifier l'utilisateur");

    const res       = await createCommande({ clientId, statut: "En attente", total: 0 });
    const newCmdId  = res.data._id;
    setCommandeId(newCmdId);

    // Visiteur anonyme : mémoriser le commandeId pour le retrouver à la prochaine visite
    if (!userId) localStorage.setItem(GUEST_CMD_KEY, newCmdId);

    return newCmdId;
  };

  // ── Ajouter au panier ─────────────────────────────────────────────────────
  const addToCart = async (product, quantity = 1) => {
    setSyncing(true);
    try {
      const activeCmdId = await ensureCommande();
      const pid         = String(product._id);
      const existingCP  = cpMap[pid];

      if (existingCP) {
        const newQty   = existingCP.quantite + quantity;
        await updateCommandeProduit(existingCP.cpId, { quantite: newQty, prixUnitaire: product.prix });
        const newItems = items.map((i) => i._id === pid ? { ...i, quantity: newQty } : i);
        setItems(newItems);
        setCpMap((prev) => ({ ...prev, [pid]: { ...prev[pid], quantite: newQty } }));
        await updateCommande(activeCmdId, { total: calcTotal(newItems) });
      } else {
        const cpRes    = await createCommandeProduit({
          id_commande: activeCmdId, id_produit: product._id,
          quantite: quantity, prixUnitaire: product.prix,
        });
        const newItems = [...items, { ...product, _id: pid, quantity }];
        setItems(newItems);
        setCpMap((prev) => ({
          ...prev,
          [pid]: { cpId: cpRes.data._id, quantite: quantity, prixUnitaire: product.prix },
        }));
        await updateCommande(activeCmdId, { total: calcTotal(newItems) });
      }
    } catch (err) {
      console.error("Erreur addToCart:", err);
    } finally {
      setSyncing(false);
    }
  };

  // ── Supprimer du panier ───────────────────────────────────────────────────
  const removeFromCart = async (produitId) => {
    setSyncing(true);
    const pid = String(produitId);
    try {
      const existingCP = cpMap[pid];
      if (!existingCP) return;

      await deleteCommandeProduit(existingCP.cpId);

      const newCpMap = { ...cpMap };
      delete newCpMap[pid];
      setCpMap(newCpMap);

      const newItems = items.filter((i) => i._id !== pid);
      setItems(newItems);

      if (newItems.length === 0 && commandeId) {
        await deleteCommande(commandeId);
        setCommandeId(null);
        localStorage.removeItem(GUEST_CMD_KEY);
      } else if (commandeId) {
        await updateCommande(commandeId, { total: calcTotal(newItems) });
      }
    } catch (err) {
      console.error("Erreur removeFromCart:", err);
    } finally {
      setSyncing(false);
    }
  };

  // ── Mettre à jour la quantité ─────────────────────────────────────────────
  const updateQuantity = async (produitId, quantity) => {
    if (quantity <= 0) { await removeFromCart(produitId); return; }
    setSyncing(true);
    const pid = String(produitId);
    try {
      const existingCP = cpMap[pid];
      if (!existingCP) return;

      await updateCommandeProduit(existingCP.cpId, { quantite: quantity, prixUnitaire: existingCP.prixUnitaire });
      const newItems = items.map((i) => i._id === pid ? { ...i, quantity } : i);
      setItems(newItems);
      setCpMap((prev) => ({ ...prev, [pid]: { ...prev[pid], quantite: quantity } }));
      if (commandeId) await updateCommande(commandeId, { total: calcTotal(newItems) });
    } catch (err) {
      console.error("Erreur updateQuantity:", err);
    } finally {
      setSyncing(false);
    }
  };

  // ── Vider le panier (supprime la commande en DB) ──────────────────────────
  const clearCart = async () => {
    try {
      await Promise.all(Object.values(cpMap).map((cp) => deleteCommandeProduit(cp.cpId)));
      if (commandeId) await deleteCommande(commandeId);
    } catch (err) {
      console.error("Erreur clearCart:", err);
    } finally {
      setItems([]); setCommandeId(null); setCpMap({});
      localStorage.removeItem(GUEST_CMD_KEY);
    }
  };

  // ── Confirmer la commande → statut "Confirmée" en DB ─────────────────────
  const confirmOrder = async () => {
    if (commandeId) {
      try {
        await updateCommande(commandeId, { statut: "Confirmée" });
      } catch (err) {
        console.error("Erreur confirmation:", err);
      }
    }
    setItems([]); setCommandeId(null); setCpMap({});
    localStorage.removeItem(GUEST_CMD_KEY);
  };

  const total     = calcTotal(items);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart, confirmOrder,
      total, itemCount, commandeId, syncing, cartLoaded,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
