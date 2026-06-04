/* eslint-disable prettier/prettier */
// Configuration de l'Espace Administrateur YOLO.
// Modifie ces valeurs pour changer le mot de passe d'accès ou
// brancher le futur backend Node/Express.

export const adminConfig = {
  // Mot de passe d'accès à /admin (à remplacer par une vraie auth backend)
  password: "yolo2026",

  // URL de base de votre futur backend Express (ex: "https://api.yolo.cd")
  // Laisser vide tant qu'il n'est pas déployé → l'admin utilisera localStorage.
  apiBaseUrl: "",

  // Métadonnées affichées dans le header de l'admin
  brand: {
    title: "YOLO Admin",
    subtitle: "Espace Administrateur",
  },
};
