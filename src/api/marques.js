import api from "./axios";

export const getMarques = () => api.get("/marques").catch(() => ({ data: [] }));

export const getModeles = () =>
  api.get("/models").catch(() => api.get("/modeles").catch(() => ({ data: [] })));

const tryGet = async (...paths) => {
  for (const path of paths) {
    try {
      const res = await api.get(path);
      return res;
    } catch (_) {}
  }
  return { data: [] };
};

export const getProduitMarques = () =>
  tryGet("/produit-marques", "/produit_marques", "/produit-marque", "/produit_marque");

export const getProduitModeles = () =>
  tryGet("/produit-modeles", "/produit_modeles", "/produit-modele", "/produit_modele");
