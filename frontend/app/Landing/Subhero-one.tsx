'use client'
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Button from "../components/ui/Button"

const Counter = ({ target }: { target: string }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    let start = 0
    let end = parseInt(target.replace(/\D/g, ""))
    let duration = 1500
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const value = Math.floor(progress * (end - start) + start)
      setCount(value)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isVisible, target])

  return (
    <span ref={ref}>
      {count}
      {target.replace(/[0-9]/g, "")}
    </span>
  )
}

const Subheroone = () => (
  <div className="Sub-hero">
    <div className="first-container py-24 px-8 md:px-44 flex-col justify-center items-center text-center">
      <div className="title-container">
        <h2 className="sub-title text-4xl md:text-6xl leading-[110%] font-medium">
          Regroupez en quelques secondes toutes vos données pédagogiques dans un
          espace sécurisé.
        </h2>
      </div>

      <div className="description-container my-12 w-full mx-auto">
        <p className="text-lg md:text-xl">
          Simplifiez votre travail pédagogique en centralisant instantanément
          tous vos cours, supports et évaluations dans un environnement
          numérique sécurisé. Fini les documents éparpillés; accédez à toutes
          vos ressources éducatives depuis n'importe quel appareil, en quelques
          clics seulement.
        </p>
      </div>

      <div className="CTA-section text-xl w-full flex justify-center text-white">
        <Button
          type="button"
          label="Obtenez deux mois gratuits"
          className="w-[280px] md:w-[513px] h-[64px] md:h-[78px]"
        />
      </div>
    </div>

    {/* Nouvelle section features → Material style, cartes avec ombre */}
    <div className="features grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-14 mb-20">
      {[
        {
          title: "Importation simplifiée",
          desc: "Transférez facilement vos données depuis Excel, Word ou tout autre format numérique. Qwish prend en charge vos fichiers pour que vous puissiez démarrer sans perdre de temps à ressaisir.",
          img: "/images/blob-haikei.svg",
        },
        {
          title: "Sécurité avancée",
          desc: "Toutes vos données sont protégées et sauvegardées automatiquement. Qwish garantit la confidentialité et la sécurité de vos informations pédagogiques.",
          img: "/images/blob-haikei.svg",
        },
        {
          title: "Collaboration facilitée",
          desc: "Travaillez en équipe, partagez vos ressources et suivez l’évolution de vos élèves en temps réel grâce à une interface intuitive.",
          img: "/images/blob-haikei.svg",
        },
      ].map((card, i) => (
        <div
          key={i}
          className="card bg-white p-8 flex flex-col items-center text-center"
        >
          <Image src={card.img} alt={card.title} width={120} height={120} />
          <h3 className="text-4xl font-semibold  mt-6">
            {card.title}
          </h3>
          <p className="text-xl mt-8 ">{card.desc}</p>
        </div>
      ))}
    </div>

    {/* Section evidence avec compteur animé */}
    <div className="evidence px-6 md:px-24 py-20 bg-gray-50">
      <div className="evidence-container grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          {
            img: "/images/LIONWOOD-logo.png",
            alt: "Lionwood logo",
            percentage: "65%",
            text: "des administrateurs scolaires rapportent des gains de temps significatifs grâce à la technologie",
            link: "#",
          },
          {
            img: "/images/STARTERBOOK-logo.png",
            alt: "Starterbook logo",
            percentage: "50%",
            text: "plus de 70% des étudiants estiment que les outils numériques améliorent leur productivité",
            link: "#",
          },
          {
            img: "/images/UNESCO-logo.png",
            alt: "UNESCO logo",
            percentage: "+30%",
            text: "les enseignants utilisent davantage les ressources en ligne pour préparer leurs cours",
            link: "#",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="evidence-card space-y-6 p-10 border border-gray-200 shadow-md transition-shadow duration-300 bg-white"
          >
            <div className="percentage">
              <h4 className="text-5xl font-bold text-[#0060EB]">
                <Counter target={item.percentage} />
              </h4>
            </div>
            <p className="">{item.text}</p>
            <a
              href={item.link}
              className="text-[#0060EB] font-medium hover:underline"
            >
              Lire l'article
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Subheroone
