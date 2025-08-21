import { CheckCircle } from "lucide-react";

export default function SuccessPage () {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center transform transition-all duration-500 hover:scale-105">
        {/* Icône de succès animée */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Titre principal */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
          Demande transmise avec succès !
        </h1>
        
        {/* Message de confirmation */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Merci pour votre soumission. Nous vous recontacterons dans les plus brefs délais.
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
              <p className="text-sm text-green-600 mt-1">
                Référence: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Nouvelle demande
          </button>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-300"
          >
            Retour à l'accueil
          </button>
        </div>
        
        {/* Footer informatif */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Délai de réponse habituel : 24-48 heures
          </p>
        </div>
      </div>
    </div>
  );
};
