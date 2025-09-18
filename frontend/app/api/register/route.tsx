import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase/firebaseAdmin'; // Admin SDK corrigé
import bcrypt from 'bcryptjs';

interface RegisterData {
  nom: string;
  fonction: string;
  nomEcole: string;
  email: string;
  telephone: string;
  motDePasse: string;
}

// Expressions régulières pour validation côté serveur
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+237)6(\d{8})$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.\-_+])[A-Za-z\d@$!%*?&#.\-_+]{8,}$/;
const nameRegex = /^[a-zA-ZÀ-ÿ\s-']{2,50}$/;

// Fonction de validation complète
const validateFormData = (data: RegisterData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validation nom
  if (!data.nom.trim()) {
    errors.push("Le nom est requis");
  } else if (!nameRegex.test(data.nom)) {
    errors.push("Le nom doit contenir uniquement des lettres (2-50 caractères)");
  }

  // Validation fonction
  if (!data.fonction.trim()) {
    errors.push("La fonction est requise");
  } else if (data.fonction.length < 2 || data.fonction.length > 100) {
    errors.push("La fonction doit contenir entre 2 et 100 caractères");
  }

  // Validation nom école
  if (!data.nomEcole.trim()) {
    errors.push("Le nom de l'école est requis");
  } else if (data.nomEcole.length < 2 || data.nomEcole.length > 100) {
    errors.push("Le nom de l'école doit contenir entre 2 et 100 caractères");
  }

  // Validation email
  if (!data.email.trim()) {
    errors.push("L'email est requis");
  } else if (!emailRegex.test(data.email)) {
    errors.push("Format d'email invalide");
  }

  // Validation téléphone
  if (!data.telephone.trim()) {
    errors.push("Le numéro de téléphone est requis");
  } else if (!phoneRegex.test(data.telephone)) {
    errors.push("Format de téléphone invalide");
  }

  // Validation mot de passe
  if (!data.motDePasse) {
    errors.push("Le mot de passe est requis");
  } else if (!passwordRegex.test(data.motDePasse)) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ✅ Fonction corrigée avec Admin SDK
const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    console.log('Vérification email:', email);
    
    // Utiliser Admin SDK pour la requête
    const usersRef = adminDb.collection('usersTrial');
    const querySnapshot = await usersRef.where('email', '==', email.toLowerCase()).get();
    
    const exists = !querySnapshot.empty;
    console.log('Email existe déjà:', exists);
    
    return exists;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    throw new Error('Erreur lors de la vérification de l\'email');
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Tentative d\'inscription...');
    
    // Parse des données du formulaire
    const body: RegisterData = await request.json();
    console.log('Données reçues:', { email: body.email, nom: body.nom });

    // Validation des données
    const validation = validateFormData(body);
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

    // Vérifier si l'email existe déjà
    const emailExists = await checkEmailExists(normalizedEmail);
    if (emailExists) {
      console.log('❌ Email existe déjà');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Un compte avec cet email existe déjà' 
        },
        { status: 409 }
      );
    }

    console.log('✅ Email disponible');

    // Chiffrer le mot de passe
    console.log('🔐 Chiffrement du mot de passe...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(body.motDePasse, saltRounds);

    // Préparer les données pour Firestore
    const userData = {
      nom: body.nom.trim(),
      fonction: body.fonction.trim(),
      nomEcole: body.nomEcole.trim(),
      email: normalizedEmail,
      telephone: body.telephone.trim(),
      motDePasse: hashedPassword,
      status: 'trial', // Statut trial pour l'inscription
      dateCreation: new Date(),
      dateExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      active: true
    };

    console.log('💾 Sauvegarde en cours...');
    
    // ✅ Ajouter l'utilisateur à Firestore avec Admin SDK
    const usersRef = adminDb.collection('usersTrial');
    const docRef = await usersRef.add(userData);

    console.log('🎉 Nouvel utilisateur créé avec l\'ID:', docRef.id);

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! Votre période d\'essai de 30 jours a commencé.',
      userId: docRef.id,
      trialExpiresAt: userData.dateExpiration
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Erreur lors de l\'inscription:', {
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