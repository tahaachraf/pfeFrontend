import api from "./axios";

export const getCommandes = () => api.get("/commandes");
export const createCommande = (data) => api.post("/commandes", data);
export const createCommandeProduit = (data) => api.post("/commande-produits", data);
export const getCommandeProduits = () => api.get("/commande-produits");
