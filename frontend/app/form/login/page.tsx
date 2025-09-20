"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginData {
  email: string;
  motDePasse: string;
}

interface LoginErrors {
  email?: string;
  motDePasse?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    nom: string;
    fonction: string;
    nomEcole: string;
    email: string;
    telephone: string;
    status: string;
  };
  token?: string;
  errors?: string[];
}

const LMSLogin = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    motDePasse: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showpassword, setShowpassword] = useState(true);
  const [apiMessage, setApiMessage] = useState<string>("");

  // Validation de l'email
  const validateEmail = (email: string): string | null => {
    if (!email) return "L'adresse email est requise";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Format d'email invalide";
    }
    return null;
  };

  // Validation du mot de passe
  const validateMotDePasse = (motDePasse: string): string | null => {
    if (!motDePasse) return "Le mot de passe est requis";
    return null;
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};
    const emailError = validateEmail(formData.email);
    const motDePasseError = validateMotDePasse(formData.motDePasse);

    if (emailError) newErrors.email = emailError;
    if (motDePasseError) newErrors.motDePasse = motDePasseError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof LoginErrors];
        return newErrors;
      });
    }

    if (apiMessage) setApiMessage("");
  };

  // Soumission du formulaire
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result: LoginResponse = await response.json();

      if (result.success && result.user && result.token) {
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("userData", JSON.stringify(result.user));

        setApiMessage("Connexion réussie ! Redirection...");
        setTimeout(() => {
          router.push("/dashboard-school");
        }, 1000);
      } else {
        if (result.errors && result.errors.length > 0) {
          setApiMessage(result.errors.join(", "));
        } else {
          setApiMessage(result.message || "Email ou mot de passe incorrect.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setApiMessage("Erreur de connexion au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpClick = () => router.push("./trial-register");

  const handleForgotPasswordClick = () => {
    alert('Fonction "Mot de passe oublié" (à implémenter)');
  };

  const handleShowPassword = () => setShowpassword(!showpassword);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md sm:max-w-lg">
        <div className="bg-white px-6 py-8 sm:px-8 sm:py-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <img
              src="/logo_tiny.webp" // place ton fichier dans /public
              alt="Logo TinyLMS"
              className="w-32 h-32 mx-auto mb-4 object-contain"
            />
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Connexion
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Accédez à votre plateforme éducative
            </p>
          </div>

          {/* Message API */}
          {apiMessage && (
            <div
              className={`mb-6 p-3 sm:p-4 border ${
                apiMessage.includes("réussie")
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
              }`}
            >
              <p className="text-sm sm:text-base">{apiMessage}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4 sm:space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm sm:text-base font-medium text-black mb-2"
              >
                Adresse email de l'école *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full rounded-md px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } bg-white text-black`}
                placeholder="votre.email@ecole.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="motDePasse"
                className="block text-sm sm:text-base font-medium text-black mb-2"
              >
                Mot de passe *
              </label>
              <input
                type={showpassword ? "password" : "text"}
                id="motDePasse"
                name="motDePasse"
                value={formData.motDePasse}
                onChange={handleInputChange}
                className={`w-full rounded-md px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base border ${
                  errors.motDePasse ? "border-red-500" : "border-gray-300"
                } bg-white text-black`}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              {errors.motDePasse && (
                <p className="mt-1 text-sm text-red-500">{errors.motDePasse}</p>
              )}
              <button
                type="button"
                className="text-xs sm:text-sm text-gray-900 underline py-2 sm:py-3 cursor-pointer"
                onClick={handleShowPassword}
              >
                {showpassword
                  ? "Afficher le mot de passe"
                  : "Masquer le mot de passe"}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-xs sm:text-sm text-black underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="rounded-md w-full bg-blue-600 text-white py-3 sm:py-4 px-4 hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </div>

          {/* Sign Up */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={handleSignUpClick}
                className="text-black underline font-medium"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSLogin;
