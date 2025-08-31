import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
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

// Fonction pour vérifier si l'utilisateur existe et récupérer ses données
const getUserByEmail = async (email: string): Promise<{ exists: boolean; userData?: UserData; userId?: string }> => {
  try {
    const usersRef = collection(db, 'usersTrial');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { exists: false };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as UserData;
    const userId = userDoc.id;

    return { 
      exists: true, 
      userData,
      userId 
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw new Error('Erreur lors de la vérification des identifiants');
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse des données du formulaire
    const body: LoginData = await request.json();

    // Validation des données
    const validation = validateLoginData(body);
    if (!validation.isValid) {
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

    // Vérifier si l'utilisateur existe
    const userResult = await getUserByEmail(normalizedEmail);
    if (!userResult.exists || !userResult.userData || !userResult.userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email ou mot de passe incorrect' 
        },
        { status: 401 }
      );
    }

    const { userData, userId } = userResult;

    // Vérifier si le compte est actif
    if (!userData.active) {
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
    const isPasswordValid = await bcrypt.compare(body.motDePasse, userData.motDePasse);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email ou mot de passe incorrect' 
        },
        { status: 401 }
      );
    }

    // Mettre à jour la dernière connexion
    const userDocRef = doc(db, 'usersTrial', userId);
    await updateDoc(userDocRef, {
      lastLogin: new Date(),
      lastLoginIP: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
    });

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

    console.log('Connexion réussie pour:', normalizedEmail);

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: userResponse,
      token: token
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    
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