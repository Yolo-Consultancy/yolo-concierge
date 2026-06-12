/* eslint-disable prettier/prettier */
// Configuration de l'Espace Administrateur YOLO.

export const adminConfig = {
  // Identifiants bootstrap (utilisés uniquement si apiBaseUrl est vide)
  username: "admin@yolo.cd",
  password: "yolo2026",

  // URL de base du backend Express (sans /api/v1 — ajouté automatiquement par le client)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",

  brand: {
    title: "YOLO Admin",
    subtitle: "Espace Administrateur",
  },
};
