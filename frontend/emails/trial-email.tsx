import { Html, Head, Body } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

type TrialEmailProps = {
  email: string;
};

export function TrialEmail ({email} : TrialEmailProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              brand: "#007291",
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body className="bg-white font-sans">
          <div className="min-h-screen bg-white">
            {/* Container principal */}
            <div className="max-w-2xl mx-auto bg-white">
              {/* Header avec logo */}

              {/* Contenu principal */}
              <div className="px-8 py-12">
                {/* Titre principal */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-6">
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Demande reçue !
                  </h2>
                  <p className="text-lg text-gray-600">
                    Votre essai gratuit est en cours de traitement
                  </p>
                </div>

                {/* Message principal */}
                <div className="prose prose-lg max-w-none text-center mb-12 text-[16px]">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Bonjour et merci pour votre intérêt pour Qwish ! Nous avons
                    bien reçu votre demande d'accès à notre plateforme en
                    version d'essai.
                  </p>

                  <p className="text-gray-700 leading-relaxed mb-8">
                    Notre équipe traite actuellement votre inscription et vous
                    recevrez vos identifiants de connexion
                    <span className="font-semibold text-gray-900">
                      {" "}
                      dans les 02 heures suivantes
                    </span>
                    . Vous pourrez alors explorer toutes les fonctionnalités de
                    Qwish et découvrir comment notre solution peut transformer
                    votre façon de travailler.
                  </p>
                </div>

                {/* Informations importantes */}
                <div className="bg-gray-50 rounded-xl p-8 mb-12">
                  <h3 className="text-[16px] font-semibold text-gray-900 mb-4 text-center">
                    Ce qui vous attend :
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg mb-3">
                      </div>
                      <p className="text-[16px] font-medium text-gray-900 mb-1">
                        Accès complet
                      </p>
                      <p className="text-[16px] text-gray-600">
                        48 jours d'essai gratuit
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg mb-3">
                      </div>
                      <p className="text-[16px] font-medium text-gray-900 mb-1">
                        Support dédié
                      </p>
                      <p className="text-[16px] text-gray-600">
                        Accompagnement personnalisé
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-violet-500 rounded-lg mb-3">
                      </div>
                      <p className="text-[16px] font-medium text-gray-900 mb-1">
                        Sans engagement
                      </p>
                      <p className="text-[16px] text-gray-600">
                        Annulation à tout moment
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-8 border-t border-gray-100 text-center mb-4">
                <p className="text-[16px] text-gray-500 mb-4">
                  Cet email a été envoyé à votre adresse car vous avez demandé
                  un accès trial à Qwish. Si vous n'avez pas fait cette demande,
                  veuillez nous signalez.
                </p>
                <p className="text-[16px] text-gray-400">
                  © 2025 Qwish. Tous droits réservés.
                </p>
                <div className="mt-4 flex justify-center space-x-4 text-[16px] text-gray-400">
                  <a href="#" className="hover:text-gray-600">
                    Aide
                  </a>
                  <span>•</span>
                  <a href="#" className="hover:text-gray-600">
                    Contact
                  </a>
                  <span>•</span>
                  <a href="#" className="hover:text-gray-600">
                    Confidentialité
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default TrialEmail;
