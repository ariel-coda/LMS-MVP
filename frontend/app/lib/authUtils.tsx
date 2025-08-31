// app/lib/authUtils.ts

interface User {
  id: string;
  nom: string;
  fonction: string;
  nomEcole: string;
  email: string;
  telephone: string;
  status: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  errors?: string[];
}

export class AuthService {
  private static TOKEN_KEY = 'authToken';
  private static USER_KEY = 'userData';

  // Connexion utilisateur
  static async login(email: string, motDePasse: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, motDePasse }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user && data.token) {
        // Stocker les données d'authentification
        localStorage.setItem(this.TOKEN_KEY, data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  // Vérifier si l'utilisateur est authentifié
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) return false;

      // Vérifier si le token n'est pas expiré
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return tokenData.exp > currentTime;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  }

  // Récupérer les données utilisateur
  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  // Récupérer le token
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Déconnexion
  static logout(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Mettre à jour les données utilisateur
  static updateUser(userData: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  // Intercepteur pour les requêtes authentifiées
  static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
}