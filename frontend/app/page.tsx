"use client";

import React, { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Database,
  Zap,
  BookOpen,
  TrendingUp,
  Clock,
  Smartphone,
  Check,
  Menu,
  X,
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

interface VisibilityState {
  [key: string]: boolean;
}

export default function LandingPage(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<VisibilityState>({});

  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[id^="section-"]');
    sections.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features: Feature[] = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Toutes vos données au même endroit",
      description:
        "Centralisez élèves, cours et documents pour gagner du temps et simplifier l’organisation.",
      benefits: [
        "Accès facile à toutes les informations",
        "Organisation simplifiée pour le personnel",
        "Sécurité des données assurée",
      ],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Automatisation des tâches répétitives",
      description:
        "Inscription des élèves, notifications et rappels automatiques, sans efforts supplémentaires.",
      benefits: [
        "Moins d’erreurs administratives",
        "Personnel libéré pour l’essentiel",
        "Processus simplifiés",
      ],
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Gestion flexible des cours",
      description:
        "Créez vos modules, ajoutez vidéos ou documents et adaptez facilement vos plannings.",
      benefits: [
        "Cours organisés simplement",
        "Contenus multimédias intégrés",
        "Flexibilité pour enseignants et élèves",
      ],
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Planification et organisation facilitées",
      description:
        "Suivez les emplois du temps de vos cours et des activités de l’école d’un coup d’œil.",
      benefits: [
        "Organisation claire et rapide",
        "Gain de temps pour le personnel",
        "Vue d’ensemble de l’activité de l’école",
      ],
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Simple et accessible",
      description:
        "Interface claire, responsive et mobile-first, facile à prendre en main dès le premier jour.",
      benefits: [
        "Aucune compétence technique requise",
        "Accès mobile optimisé",
        "Utilisation intuitive pour tous",
      ],
    },
  ];

  const stats = [
    { number: "100%", label: "Focalisé sur les petites écoles" },
    { number: "0 stress", label: "Administration simplifiée" },
    { number: "1 clic", label: "Pour créer vos cours et exercices" },
    { number: "∞", label: "Accès partout, à tout moment" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <span className="text-2xl font-bold text-blue-600  bg-clip-text">
                TinyLMS
              </span>
            </div>

            <nav className="hidden md:flex space-x-8">
              {["Notre solution", ""].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`font-medium transition-all duration-300 relative ${
                    item === "Notre solution"
                      ? "text-blue-600" // actif
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            <button
              className="md:hidden p-2 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-blue/95 backdrop-blur-xl border-t border-gray-100/50">
            <nav className="px-4 py-4 space-y-2">
              {["Notre solution", ""].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block py-3 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-white"></div>
        <div className="relative max-w-7xl max-h-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 overflow-hidden">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Solution innovante pour écoles modernes</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              La solution simple pour
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-400 bg-clip-text text-transparent">
                gérer vos cours et vos élèves
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Offrez à vos étudiants des cours en ligne structurés et
              accessibles, sans vous compliquer la vie avec plusieurs outils
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push("./form/trial-register")}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform  flex items-center space-x-2"
              >
                <span>Démarrer votre essai gratuit</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-12 sm:display-none md:display-none">
              <img
                src="/screenshots/tinylms.webp"
                alt="Aperçu de la plateforme"
                className="mx-auto rounded-xl shadow-lg border border-gray-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="section-features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités qui transforment votre gestion
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des outils puissants conçus pour simplifier et optimiser chaque
              aspect de votre établissement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-white rounded-2xl p-8 shadow-xs border border-gray-100 hover:border-blue-200 transition-all duration-100${
                  isVisible["section-features"]
                    ? "animate-fade-in opacity-100"
                    : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-blue-title mb-6">
            Structurez vos cours en ligne facilement, vos étudiants vous
            remercieront.
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto bg-blue-text">
            Ne perdez plus du temps à multiplier les outils pour gérer vos cours
            et suivre vos étudiants, TinyLMS vous permet de tout organiser et
            partager depuis une seule plateforme, fiable et facile à prendre en
            main.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("./form/trial-register")}
              className="bg-white text-blue-700 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform"
            >
              Commencer maintenant
            </button>
            <a
              href="https://api.whatsapp.com/send?phone=237653189528"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg inline-block text-center"
            >
              Planifier une démonstration
            </a>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 bg-blue-title py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              {/*<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>*/}
              <span className="text-xl font-bold">TinyLMS</span>
            </div>

            <div className="bg-blue-text text-center md:text-right">
              <p>&copy; 2025 TinyLMS. Tous droits réservés.</p>
              <p className="text-sm mt-1">Simplifiez. Automatisez. Excellez.</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
