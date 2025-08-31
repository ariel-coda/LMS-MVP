// utils/auth.ts

export interface User {
  id: string;
  nom: string;
  fonction: string;
  nomEcole: string;
  email: string;
  telephone: string;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  errors?: string[];
}

// Note: Ces fonctions utilisent localStorage et doivent être utilisées côté client uniquement
// Stocker le token et les données utilisateur
export const setAuthData = (token: string, user: User): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_data", JSON.stringify(user));
  }
};

// Récupérer le token d'authentification
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Récupérer les données utilisateur
export const getUserData = (): User | null => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const userData = getUserData();

  if (!token || !userData) {
    return false;
  }

  // Vérifier si le token n'est pas expiré
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp < currentTime) {
      // Token expiré, nettoyer les données
      clearAuthData();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    clearAuthData();
    return false;
  }
};

// Nettoyer les données d'authentification (déconnexion)
export const clearAuthData = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  }
};

// Déconnecter l'utilisateur
export const logout = (): void => {
  clearAuthData();
  // Rediriger vers la page de connexion
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// Fonction pour effectuer des requêtes API authentifiées
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  // Utilisation de l'API native Headers pour éviter les erreurs TS
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
