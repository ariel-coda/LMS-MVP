import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase/firebaseAdmin'; // Admin SDK
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LoginData {
  email: string;
  motDePasse: string;
}

interface UserData {
  nom: string;
  fonction: string;
  nomEcole: string;
  email: string;
  telephone: string;
  motDePasse: string;
  status: string;
  dateCreation: any;
  dateExpiration: any;
  active: boolean;
}

// Expressions régulières pour validation côté serveur
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fonction de validation des données de connexion
const validateLoginData = (data: LoginData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validation email
  if (!data.email.trim()) {
    errors.push("L'adresse email est requise");
  } else if (!emailRegex.test(data.email)) {
    errors.push("Format d'email invalide");
  }

  // Validation mot de passe
  if (!data.motDePasse) {
    errors.push("Le mot de passe est requis");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonction pour générer un token JWT
const generateToken = (userId: string, email: string): string => {
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 heures
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'votre-secret-jwt-super-securise');
};

// ✅ Fonction corrigée avec Admin SDK
const getUserByEmail = async (email: string): Promise<{ exists: boolean; userData?: UserData; userId?: string }> => {
  try {
    console.log('Recherche utilisateur avec email:', email);
    
    // Utiliser Admin SDK pour la requête
    const usersRef = adminDb.collection('usersTrial');
    const querySnapshot = await usersRef.where('email', '==', email.toLowerCase()).get();
    
    if (querySnapshot.empty) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return { exists: false };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as UserData;
    const userId = userDoc.id;

    console.log('Utilisateur trouvé:', { userId, email: userData.email });

    return { 
      exists: true, 
      userData,
      userId 
    };
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération de l\'utilisateur:', {
      error: error,
      message: (error as any)?.message,
      code: (error as any)?.code
    });
    throw new Error('Erreur lors de la vérification des identifiants');
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Tentative de connexion...');
    
    // Parse des données du formulaire
    const body: LoginData = await request.json();
    console.log('Données reçues:', { email: body.email });

    // Validation des données
    const validation = validateLoginData(body);
    if (!validation.isValid) {
      console.log('❌ Validation échouée:', validation.errors);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Données invalides', 
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Normaliser l'email
    const normalizedEmail = body.email.toLowerCase().trim();
    console.log('Email normalisé:', normalizedEmail);

    // Vérifier si l'utilisateur existe
    const userResult = await getUserByEmail(normalizedEmail);
    if (!userResult.exists || !userResult.userData || !userResult.userId) {
      console.log('❌ Utilisateur non trouvé ou données manquantes');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email ou mot de passe incorrect' 
        },
        { status: 401 }
      );
    }

    const { userData, userId } = userResult;
    console.log('✅ Utilisateur trouvé:', { userId, active: userData.active, status: userData.status });

    // Vérifier si le compte est actif
    if (!userData.active) {
      console.log('❌ Compte désactivé');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Votre compte a été désactivé. Contactez l\'administrateur.' 
        },
        { status: 403 }
      );
    }

    // Vérifier si la période d'essai n'est pas expirée (pour les comptes trial)
    if (userData.status === 'trial' && userData.dateExpiration) {
      const now = new Date();
      const expirationDate = userData.dateExpiration.toDate ? userData.dateExpiration.toDate() : new Date(userData.dateExpiration);
      
      if (now > expirationDate) {
        console.log('❌ Période d\'essai expirée');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Votre période d\'essai a expiré. Contactez l\'administrateur pour renouveler votre accès.' 
          },
          { status: 403 }
        );
      }
    }

    // Vérifier le mot de passe
    console.log('🔍 Vérification du mot de passe...');
    const isPasswordValid = await bcrypt.compare(body.motDePasse, userData.motDePasse);
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email ou mot de passe incorrect' 
        },
        { status: 401 }
      );
    }

    console.log('✅ Mot de passe correct');

    // Mettre à jour la dernière connexion avec Admin SDK
    try {
      const userDocRef = adminDb.collection('usersTrial').doc(userId);
      await userDocRef.update({
        lastLogin: new Date(),
        lastLoginIP: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
      });
      console.log('✅ Dernière connexion mise à jour');
    } catch (updateError) {
      console.warn('⚠️ Erreur lors de la mise à jour de la dernière connexion:', updateError);
      // Ne pas faire échouer la connexion pour cette erreur
    }

    // Générer le token JWT
    const token = generateToken(userId, userData.email);

    // Préparer les données utilisateur à renvoyer (sans le mot de passe)
    const userResponse = {
      id: userId,
      nom: userData.nom,
      fonction: userData.fonction,
      nomEcole: userData.nomEcole,
      email: userData.email,
      telephone: userData.telephone,
      status: userData.status
    };

    console.log('🎉 Connexion réussie pour:', normalizedEmail);

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: userResponse,
      token: token
    }, { status: 200 });

  } catch (error) {
    console.error('💥 Erreur lors de la connexion:', {
      error: error,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur interne du serveur. Veuillez réessayer plus tard.' 
      },
      { status: 500 }
    );
  }
}

// Gestion des autres méthodes HTTP
export async function GET() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' },
    { status: 405 }
  );
}