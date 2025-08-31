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
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
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
      return "Format de téléphone invalide (ex: 0123456789 ou +33123456789)";
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
      const nomError = validateNom(formData.nom);
      const fonctionError = validateFonction(formData.fonction);
      const nomEcoleError = validateNomEcole(formData.nomEcole);

      if (nomError) newErrors.nom = nomError;
      if (fonctionError) newErrors.fonction = fonctionError;
      if (nomEcoleError) newErrors.nomEcole = nomEcoleError;
    }

    if (step === 2) {
      const emailError = validateEmail(formData.email);
      const telephoneError = validateTelephone(formData.telephone);
      const motDePasseError = validateMotDePasse(formData.motDePasse);

      if (emailError) newErrors.email = emailError;
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
    if (validateStep(1)) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = (): void => {
    setCurrentStep(1);
  };

  const handleShowPassword = (): void => {
    setShowpassword(!showpassword);
  };

  const handleSubmit = async (): Promise<void> => {
    // Validation complète avant soumission
    if (!validateStep(2)) {
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
        router.push("../login");

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-5">
      <div className="w-full max-w-lg bg-white px-8 py-10 border border-gray-200"> 
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">E</div>
          <h1 className="text-3xl font-semibold text-black mb-2">
            Inscription Trial LMS
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez notre plateforme d'apprentissage
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center  mb-8">
          <div className="flex items-center justify-center space-x-4 w-full">
            <div
              className={`w-10 h-10 border-2 rounded-full ${
                currentStep >= 1 ? "bg-blue-500 border-blue-500" : "border-gray-300"
              } flex items-center justify-center`}
            >
              <span
                className={`text-base font-medium ${
                  currentStep >= 1 ? "text-white" : "text-gray-400"
                }`}
              >
                1
              </span>
            </div>
            <div
              className={`w-10 h-10 border-2 rounded-full ${
                currentStep >= 2 ? "bg-blue-500 border-blue-500" : "border-gray-300"
              } flex items-center justify-center`}
            >
              <span
                className={`text-base font-medium ${
                  currentStep >= 2 ? "text-white" : "text-gray-400"
                }`}
              >
                2
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-black">
                  Informations personnelles
                </h2>
              </div>

              <div>
                <label
                  htmlFor="nom"
                  className="block text-base font-medium text-black mb-2"
                >
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 text-base border-2 ${
                    errors.nom ? "border-red-500" : "border-gray-300"
                  } bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black focus:rounded`}
                  placeholder="Votre nom complet"
                />
                {errors.nom && (
                  <p className="mt-1 text-base text-red-500">{errors.nom}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fonction"
                  className="block text-base font-medium text-black mb-2"
                >
                  Fonction *
                </label>
                <input
                  type="text"
                  id="fonction"
                  name="fonction"
                  value={formData.fonction}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 text-base border-2 ${
                    errors.fonction ? "border-red-500" : "border-gray-300"
                  } bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black rounded`}
                  placeholder="Votre fonction (ex: Directeur, Enseignant...)"
                />
                {errors.fonction && (
                  <p className="mt-1 text-base text-red-500">
                    {errors.fonction}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="nomEcole"
                  className="block text-base font-medium text-black mb-2"
                >
                  Nom de l'école *
                </label>
                <input
                  type="text"
                  id="nomEcole"
                  name="nomEcole"
                  value={formData.nomEcole}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 text-base border-2 ${
                    errors.nomEcole ? "border-red-500" : "border-gray-300"
                  } bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black rounded`}
                  placeholder="Nom de votre établissement"
                />
                {errors.nomEcole && (
                  <p className="mt-1 text-base text-red-500">
                    {errors.nomEcole}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-4 px-4 border border-blue-600 hover:bg-blue-700 transition-colors duration-200 font-medium text-base cursor-pointer"
              >
                Suivant
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-black">
                  Informations de contact
                </h2>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-base font-medium text-black mb-2"
                >
                  Adresse email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 text-base border-2 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black rounded`}
                  placeholder="votre.email@ecole.fr"
                />
                {errors.email && (
                  <p className="mt-1 text-base text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="telephone"
                  className="block text-base font-medium text-black mb-2"
                >
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 text-base border-2 ${
                    errors.telephone ? "border-red-500" : "border-gray-300"
                  } bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black rounded`}
                  placeholder="0123456789"
                />
                {errors.telephone && (
                  <p className="mt-1 text-base text-red-500">
                    {errors.telephone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="motDePasse"
                  className="block text-base font-medium text-black mb-2"
                >
                  Mot de passe *
                </label>
                <input
                  type={showpassword ? "password" : "text"}
                  id="motDePasse"
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 text-base border-2 ${
                    errors.motDePasse ? "border-red-500" : "border-gray-300"
                  } bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black rounded`}
                  placeholder="••••••••"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 8 caractères, une majuscule, une minuscule et un
                  chiffre
                </p>
                <button
                  className="text-sm py-3 cursor-pointer underline text-black"
                  onClick={handleShowPassword}
                >
                  {showpassword
                    ? "afficher le mot de passe"
                    : "masquer le mot de passe"}
                </button>
                {errors.motDePasse && (
                  <p className="mt-1 text-base text-red-500">
                    {errors.motDePasse}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 bg-white text-blue-600 py-4 px-4 border border-blue-600 hover:bg-gray-100 transition-colors duration-200 font-medium text-base cursor-pointer"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-4 px-4 border border-blue-600 hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
                >
                  {isSubmitting ? "Inscription..." : "S'inscrire"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            En vous inscrivant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
};

export default LMSTrialForm;
