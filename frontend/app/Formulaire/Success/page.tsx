"use client";

import Navbar from "@/app/components/layout/Navbar";
import Button from "@/app/components/ui/Button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";


export default function SuccessPage () {

  const router = useRouter();

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-xl text-center">
        {/* Icône de succès animée */}
        <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Titre principal */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
          Demande transmise avec succès !
        </h1>
        
        {/* Message de confirmation */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Merci pour votre soumission. Nous vous avons envoyé un email de confirmation à l'adresse mail fournie.
          <br /> 
        </p>
        
        {/* Informations supplémentaires */}
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 text-left rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 font-medium">
                Votre demande a été enregistrée
              </p>
            </div>
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="space-y-3">
          
          <Button
            label = "Retour à l'accueil"
            className="w-full text-white font-medium py-3 px-6 rounded-lg duration-300"
            onClick={() => router.push("/")}
          />
        </div>
        
        {/* Footer informatif */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Délai de réponse habituel : 12-18 heures
          </p>
        </div>
      </div>
    </div>
    </>
  );
};
