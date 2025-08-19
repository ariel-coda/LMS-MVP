'use client'

import { useEffect, useState } from 'react'

export const FeatureSection = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Associe chaque couleur à ses classes Tailwind
  const colorClasses: Record<string, { bg: string; text: string; progress: string }> = {
    green: { bg: "bg-green-300", text: "text-green-600", progress: "bg-green-500" },
    violet: { bg: "bg-violet-300", text: "text-violet-600", progress: "bg-violet-500" },
    orange: { bg: "bg-orange-300", text: "text-orange-600", progress: "bg-orange-500" },
  }

  const features = [
    {
      title: "Optimisez le suivi de vos étudiants.",
      text: "Consultez en un clic toutes les informations de progression de vos étudiants depuis un seul écran, facilitant votre prise de décision et votre accompagnement personnalisé.",
      color: "green"
    },
    { 
      title: "Améliorez vos cours grâce aux feedbacks et reportings.",
      text: "Analysez les performances et adaptez vos méthodes d'enseignement grâce aux données collectées automatiquement.",
      color: "violet"
    },
    { 
      title: "Communiquez de façon directe et efficace avec vos étudiants.",
      text: "Envoyez des messages ciblés et recevez des retours instantanés pour maintenir l'engagement de vos apprenants.",
      color: "orange"
    }
  ]

  // Barre de progression automatique (8s)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setActiveIndex(current => (current + 1) % features.length)
          return 0
        }
        return prev + 100 / 80
      })
    }, 100)

    return () => clearInterval(timer)
  }, [features.length])

  return (
    <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto pt-42 gap-12 px-6">
      
      {/* Bloc image gauche */}
      <div 
        className={`relative w-full md:w-1/2 h-[450px] overflow-hidden flex-shrink-0 
        ${colorClasses[features[activeIndex].color].bg}`}
      >
        {/* Exemple image (à remplacer par un vrai visuel) */}
      </div>

      {/* Contenu texte (dépliants) */}
      <div className="flex flex-col gap-6 flex-1">
        {features.map((feature, i) => (
          <div 
            key={i} 
            className="pb-4 cursor-pointer"
            onClick={() => {
              setActiveIndex(i)
              setProgress(0)
            }}
          >
            {/* Titre */}
            <h3 className={`font-medium text-left text-2xl md:text-3xl transition-colors duration-300 
              ${i === activeIndex ? colorClasses[feature.color].text : ''}`}>
              {feature.title}
            </h3>

            {/* Texte dépliant */}
            <div 
              className={`overflow-hidden
              ${i === activeIndex ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
            >
              <p className="leading-relaxed text-left text-lg md:text-xl mb-6">
                {feature.text}
              </p>

              {/* Barre de progression */}
              {i === activeIndex && (
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colorClasses[feature.color].progress} transition-all duration-100 ease-linear`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeatureSection
