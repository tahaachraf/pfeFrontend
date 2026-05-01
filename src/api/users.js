import api from "./axios";

export const getUsers = () => api.get("/users");

// Login → POST /api/auth/login (défini dans server.js)
export const loginUser = (email, motDePasse) =>
  api.post("/auth/login", { email, motDePasse });

// Inscription → POST /api/users
// server.js : app.use("/api", utilisateursRoutes)
// utilisateurs.routes.js : router.post("/users", createUser)  → /api/users
export const registerUser = (data) =>
  api.post("/users", {
    prenom:     data.prenom,
    nom:        data.nom,
    email:      data.email,
    motDePasse: data.motDePasse,
  });
