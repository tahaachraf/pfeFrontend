import api from "./axios";

export const getFournisseurs = () => api.get("/fournisseurs");
export const createFournisseur = (data) => api.post("/fournisseurs", data);
export const getProduitsFournisseurs = () => api.get("/produits-fournisseurs");
export const createProduitFournisseur = (data) => api.post("/produits-fournisseurs", data);
