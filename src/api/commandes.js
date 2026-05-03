import api from "./axios";

// ── Commandes ────────────────────────────────────────────────────────────────
export const getCommandes          = ()      => api.get("/commandes");
export const getCommandeById       = (id)    => api.get(`/commandes/${id}`);
export const createCommande        = (data)  => api.post("/commandes", data);
export const updateCommande        = (id, d) => api.put(`/commandes/${id}`, d);
export const deleteCommande        = (id)    => api.delete(`/commandes/${id}`);

// ── Commande-Produits ─────────────────────────────────────────────────────────
export const getCommandeProduits   = ()      => api.get("/commande-produits");
export const createCommandeProduit = (data)  => api.post("/commande-produits", data);
export const updateCommandeProduit = (id, d) => api.put(`/commande-produits/${id}`, d);
export const deleteCommandeProduit = (id)    => api.delete(`/commande-produits/${id}`);
