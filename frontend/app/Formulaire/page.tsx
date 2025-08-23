"use client";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/Firebase";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const TrialForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    institutionName: "",
    institutionEmail: "",
    institutionPhone: "",
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [validFields, setValidFields] = useState<{ [key: string]: boolean }>(
    {}
  );
  const router = useRouter();

  // Suggestions de fonctions dans une école de formation
  const positionSuggestions: string[] = [
    "Directeur/Directrice",
    "Directeur pédagogique",
    "Responsable formation",
    "Coordinateur pédagogique",
    "Formateur/Formatrice",
    "Responsable qualité",
    "Chargé de développement",
    "Responsable commercial",
    "Assistant pédagogique",
    "Responsable des stages",
    "Conseiller en formation",
    "Responsable digital learning",
    "IT support",
  ];

  const filteredSuggestions = positionSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(formData.position.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData((prev) => ({
      ...prev,
      position: suggestion,
    }));
    setShowSuggestions(false);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const newValidFields: { [key: string]: boolean } = {};

    // Validation nom complet
    const NameRegex =
      /^(?!.*[<>{}()[\]"';=`$\\#])[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'.]{2,50}$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est obligatoire";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Le nom doit contenir au moins 2 caractères";
    } else if (!NameRegex.test(formData.fullName.trim())) {
      newErrors.fullName =
        "Veuillez saisir un nom complet valide (2-50 caractères, pas de caractères spéciaux)";
    } else {
      newValidFields.fullName = true;
    }

    // Validation fonction
    if (!formData.position.trim()) {
      newErrors.position = "La fonction est obligatoire";
    } else if (formData.position.trim().length < 2) {
      newErrors.position = "La fonction doit contenir au moins 2 caractères";
    } else {
      newValidFields.position = true;
    }

    // Validation nom du centre
    if (!formData.institutionName.trim()) {
      newErrors.institutionName = "Le nom du centre est obligatoire";
    } else if (formData.institutionName.trim().length < 2) {
      newErrors.institutionName =
        "Le nom du centre doit contenir au moins 2 caractères";
    } else {
      newValidFields.institutionName = true;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.institutionEmail.trim()) {
      newErrors.institutionEmail = "L'email du centre est obligatoire";
    } else if (!emailRegex.test(formData.institutionEmail)) {
      newErrors.institutionEmail = "Veuillez saisir un email valide";
    } else {
      newValidFields.institutionEmail = true;
    }

    // Validation téléphone
    const phoneRegex = /^(?:\+237|0)[1-9](?:[0-9]{8})$/;
    if (!formData.institutionPhone.trim()) {
      newErrors.institutionPhone = "Le numéro de téléphone est obligatoire";
    } else if (!phoneRegex.test(formData.institutionPhone.replace(/\s/g, ""))) {
      newErrors.institutionPhone =
        "Veuillez saisir un numéro de téléphone camerounais valide ex: +237 6XX XX XX XX";
    } else {
      newValidFields.institutionPhone = true;
    }

    setErrors(newErrors);
    setValidFields(newValidFields);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // 1. Sauvegarde Firestore
        await addDoc(collection(db, "trialRequests"), {
          ...formData,
          createdAt: new Date(),
        });

        // 2. Appel API envoi email
        const res = await fetch("/api/send-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await res.json();
        if (result.success) {
          // redirection OK
          router.push("/Formulaire/success");
        } else {
          console.error("❌ Erreur API email :", result.error);
        }
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi :", error);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-42 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-[130%]">
              Démarrez votre essai gratuit
            </h1>
            <p className="text-xl">
              Profitez de{" "}
              <span className="text-violet-600 font-medium">
                2 mois d'accès gratuit
              </span>{" "}
              pour découvrir comment notre plateforme peut simplifier la gestion
              de vos formations.{" "}
              <span className="text-violet-600 font-medium">
                Sans engagement, sans carte bancaire
              </span>
              .
            </p>

            {/* Messages d'erreur globaux 
            {Object.keys(errors).length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold mb-2">
                  Veuillez corriger les erreurs suivantes :
                </p>
                <ul className="text-red-700 text-left list-disc list-inside space-y-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}*/}
          </div>

          {/* Form */}
          <div className="p-8 md:p-12 space-y-8">
            {/* Nom complet */}
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              label="Nom complet"
              placeholder="Votre nom et prénom"
              error={errors.fullName}
              isValid={validFields.fullName}
            />

            {/* Fonction */}
            <div className="space-y-3 relative">
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handlePositionChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                required
                label="Fonction"
                placeholder="Votre fonction dans l'établissement"
                error={errors.position}
                isValid={validFields.position}
              />

              {/* Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-6 py-3 text-lg hover:bg-blue-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nom de l'établissement */}
            <Input
              id="institutionName"
              name="institutionName"
              value={formData.institutionName}
              onChange={handleInputChange}
              required
              label="Nom du centre"
              placeholder="Nom de votre centre de formation"
              error={errors.institutionName}
              isValid={validFields.institutionName}
            />

            {/* Email de l'établissement */}
            <Input
              id="institutionEmail"
              name="institutionEmail"
              type="email"
              value={formData.institutionEmail}
              onChange={handleInputChange}
              required
              label="Email du centre"
              placeholder="contact@votreetablissement.fr"
              error={errors.institutionEmail}
              isValid={validFields.institutionEmail}
            />

            {/* Telephone de l'établissement */}
            <Input
              id="institutionPhone"
              name="institutionPhone"
              type="tel"
              value={formData.institutionPhone}
              onChange={handleInputChange}
              required
              label="Numéro de téléphone du centre"
              placeholder="Numéro de téléphone de votre centre de formation"
              error={errors.institutionPhone}
              isValid={validFields.institutionPhone}
            />

            <div className="pt-6">
              <Button
                type="button"
                label="Activez votre essai gratuit"
                className="text-white w-full text-lg"
                onClick={handleSubmit}
              />
            </div>

            {/* Texte légal */}
            <div className="pt-4">
              <p className="text-base text-gray-600 text-center leading-relaxed">
                En démarrant votre plan gratuit, vous acceptez avoir lu et
                acceptez les{" "}
                <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  conditions d'utilisation
                </span>{" "}
                et la{" "}
                <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  politique de confidentialité
                </span>{" "}
                de Qwish.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrialForm;
