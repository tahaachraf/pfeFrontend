import api from "./axios";

export const getProduits = () => api.get("/produits");
export const getProduit = (id) => api.get(`/produits/${id}`);
export const createProduit = (data) => api.post("/produits", data);
export const updateProduit = (id, data) => api.put(`/produits/${id}`, data);
export const deleteProduit = (id) => api.delete(`/produits/${id}`);
export const getImagesProduits = () => api.get("/images-produits");
export const getProduitsComplementaires = () => api.get("/produits-complementaires");
export const getPiecesJointes = (id_produit) => api.get(`/pieces-jointes?id_produit=${id_produit}`);
