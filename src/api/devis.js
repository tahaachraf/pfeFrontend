import api from "./axios";

export const getDevis = () => api.get("/devis");
export const createDevis = (data) => api.post("/devis", data);
export const getDevisProduits = () => api.get("/devis-produits");
export const createDevisProduit = (data) => api.post("/devis-produits", data);
