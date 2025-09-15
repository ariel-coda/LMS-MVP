"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  nom: string;
  fonction: string;
  nomEcole: string;
  email: string;
  telephone: string;
  motDePasse: string;
}

interface FormErrors {
  nom?: string;
  fonction?: string;
  nomEcole?: string;
  email?: string;
  telephone?: string;
  motDePasse?: string;
}

const LMSTrialForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    fonction: "",
    nomEcole: "",
    email: "",
    telephone: "",
    motDePasse: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showpassword, setShowpassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Expressions régulières pour la validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+237)6(\d{8})$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.\-_+])[A-Za-z\d@$!%*?&#.\-_+]{8,}$/;
  const nameRegex = /^[a-zA-ZÀ-ÿ\s-']{2,50}$/;

  // Fonctions de validation
  const validateNom = (nom: string): string => {
    if (!nom.trim()) return "Le nom est requis";
    if (!nameRegex.test(nom))
      return "Le nom doit contenir uniquement des lettres (2-50 caractères)";
    return "";
  };

  const validateFonction = (fonction: string): string => {
    if (!fonction.trim()) return "La fonction est requise";
    if (fonction.length < 2 || fonction.length > 100)
      return "La fonction doit contenir entre 2 et 100 caractères";
    return "";
  };

  const validateNomEcole = (nomEcole: string): string => {
    if (!nomEcole.trim()) return "Le nom de l'école est requis";
    if (nomEcole.length < 2 || nomEcole.length > 100)
      return "Le nom de l'école doit contenir entre 2 et 100 caractères";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "L'email est requis";
    if (!emailRegex.test(email)) return "Format d'email invalide";
    return "";
  };

  const validateTelephone = (telephone: string): string => {
    if (!telephone.trim()) return "Le numéro de téléphone est requis";
    if (!phoneRegex.test(telephone))
      return "Format de téléphone invalide (ex: +237693456789)";
    return "";
  };

  const validateMotDePasse = (motDePasse: string): string => {
    if (!motDePasse) return "Le mot de passe est requis";
    if (!passwordRegex.test(motDePasse))
      return "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre";
    return "";
  };

  // Validation par étape
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      // Étape 1: Nom + Fonction
      const nomError = validateNom(formData.nom);
      const fonctionError = validateFonction(formData.fonction);

      if (nomError) newErrors.nom = nomError;
      if (fonctionError) newErrors.fonction = fonctionError;
    }

    if (step === 2) {
      // Étape 2: École + Email
      const nomEcoleError = validateNomEcole(formData.nomEcole);
      const emailError = validateEmail(formData.email);

      if (nomEcoleError) newErrors.nomEcole = nomEcoleError;
      if (emailError) newErrors.email = emailError;
    }

    if (step === 3) {
      // Étape 3: Téléphone + Mot de passe
      const telephoneError = validateTelephone(formData.telephone);
      const motDePasseError = validateMotDePasse(formData.motDePasse);

      if (telephoneError) newErrors.telephone = telephoneError;
      if (motDePasseError) newErrors.motDePasse = motDePasseError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleNext = (): void => {
    if (currentStep === 1 && validateStep(1)) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep(2)) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = (): void => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleShowPassword = (): void => {
    setShowpassword(!showpassword);
  };

  const handleSubmit = async (): Promise<void> => {
    // Validation complète avant soumission
    if (!validateStep(3)) {
      console.log("Erreurs de validation:", errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Envoi des données à l'API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Inscription réussie ! ${result.message}`);
        router.push("./login");

        // Réinitialiser le formulaire
        setFormData({
          nom: "",
          fonction: "",
          nomEcole: "",
          email: "",
          telephone: "",
          motDePasse: "",
        });
        setErrors({});
        setCurrentStep(1);
      } else {
        // Gestion des erreurs de l'API
        if (result.errors && Array.isArray(result.errors)) {
          alert(`Erreur de validation :\n${result.errors.join("\n")}`);
        } else {
          alert(
            result.message || "Une erreur est survenue lors de l'inscription."
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert(
        "Erreur de connexion. Vérifiez votre connexion internet et réessayez."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInClick = () => router.push("./login");

return (
  <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white">
    <div className="w-full max-w-md sm:max-w-lg">
      <div className="bg-white px-6 py-8 sm:px-8 sm:py-10">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">E</div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Inscription Trial LMS</h1>
          <p className="text-sm sm:text-base text-gray-600">Découvrez notre plateforme d'apprentissage</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Étape {currentStep} sur 3
            </span>
            <span className="text-xs sm:text-sm text-gray-500">
              {Math.round((currentStep / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-md h-1">
            <div 
              className="bg-blue-500 h-1 rounded-md transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 sm:space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="nom" className="block text-sm sm:text-base font-medium text-black mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full rounded-md px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border ${errors.nom ? 'border-red-500' : 'border-gray-300'} bg-white text-black`}
                  placeholder="Votre nom complet"
                />
                {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
              </div>

              <div>
                <label htmlFor="fonction" className="block text-sm sm:text-base font-medium text-black mb-2">
                  Fonction dans l'établissement *
                </label>
                <input
                  type="text"
                  id="fonction"
                  name="fonction"
                  value={formData.fonction}
                  onChange={handleInputChange}
                  className={`w-full rounded-md px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border ${errors.fonction ? 'border-red-500' : 'border-gray-300'} bg-white text-black`}
                  placeholder="Votre fonction (ex: Directeur, Enseignant...)"
                />
                {errors.fonction && <p className="mt-1 text-sm text-red-500">{errors.fonction}</p>}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="rounded-md w-full bg-blue-600 text-white py-3 sm:py-4 px-4 hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base cursor-pointer"
              >
                Suivant
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="nomEcole" className="block text-sm sm:text-base font-medium text-black mb-2">
                  Nom de l'école *
                </label>
                <input
                  type="text"
                  id="nomEcole"
                  name="nomEcole"
                  value={formData.nomEcole}
                  onChange={handleInputChange}
                  className={`w-full rounded-md px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border ${errors.nomEcole ? 'border-red-500' : 'border-gray-300'} bg-white text-black`}
                  placeholder="Nom de votre établissement"
                />
                {errors.nomEcole && <p className="mt-1 text-sm text-red-500">{errors.nomEcole}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm sm:text-base font-medium text-black mb-2">
                  Adresse email de l'école *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-md px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white text-black`}
                  placeholder="votre.email@ecole.fr"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 bg-white text-blue-600 py-3 sm:py-4 px-3 sm:px-4 border border-blue-600 hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base cursor-pointer rounded-md"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 rounded-md bg-blue-600 text-white py-3 sm:py-4 px-3 sm:px-4 hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base cursor-pointer"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="telephone" className="block text-sm sm:text-base font-medium text-black mb-2">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className={`w-full rounded-md px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border ${errors.telephone ? 'border-red-500' : 'border-gray-300'} bg-white text-black`}
                  placeholder="+237 XX XX XX XX"
                />
                {errors.telephone && <p className="mt-1 text-sm text-red-500">{errors.telephone}</p>}
              </div>

              <div>
                <label htmlFor="motDePasse" className="block text-sm sm:text-base font-medium text-black mb-2">
                  Mot de passe *
                </label>
                <input
                  type={showpassword ? "password" : "text"}
                  id="motDePasse"
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleInputChange}
                  className={`w-full rounded-md px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border ${errors.motDePasse ? 'border-red-500' : 'border-gray-300'} bg-white text-black`}
                  placeholder="••••••••"
                />
                {errors.motDePasse && <p className="mt-1 text-sm text-red-500">{errors.motDePasse}</p>}
                <button type="button" className="text-xs sm:text-sm text-gray-900 underline py-2 sm:py-3 cursor-pointer" onClick={handleShowPassword}>
                  {showpassword ? "Afficher le mot de passe" : "Masquer le mot de passe"}
                </button>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 bg-white text-blue-600 py-3 sm:py-4 px-3 sm:px-4 border border-blue-600 hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base cursor-pointer rounded-md"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-blue-600 text-white py-3 sm:py-4 px-3 sm:px-4 hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
                >
                  {isSubmitting ? "Inscription..." : "S'inscrire"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Up */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Déjà un compte ?{' '}
            <button type="button" onClick={handleSignInClick} className="text-black underline font-medium">
              Se connecter
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-base text-gray-600">
            En vous inscrivant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  </div>
);
};

export default LMSTrialForm;
