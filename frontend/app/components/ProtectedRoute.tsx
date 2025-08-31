// app/components/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      
      if (!authenticated) {
        router.push('/form/login');
        return;
      }
      
      setIsAuthenticated(authenticated);
    };

    // Vérifier immédiatement
    checkAuth();

    // Vérifier périodiquement (optionnel)
    const interval = setInterval(checkAuth, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, [router]);

  // État de chargement
  if (isAuthenticated === null) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Vérification de l'authentification...</p>
          </div>
        </div>
      )
    );
  }

  // Non authentifié - sera redirigé
  if (!isAuthenticated) {
    router.push('/form/login');
    return null;
  }

  // Authentifié - afficher le contenu
  return <>{children}</>;
}