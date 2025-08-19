import Button from "../components/ui/Button";
import TestimonialsSection from "./Testimonials";
import FeatureRevSection from "./Features-reverse";

const Subherothree = () => (
  <>
    <section className="Subherothree pb-24 px-44">
      <div className="first-container px-32 flex-col justify-center items-center text-center">
        <div className="title-container">
          <h2 className="sub-title text-6xl leading-[110%] font-medium">
            Planifiez, exécutez et automatisez en toute simplicité.
          </h2>
        </div>

        <div className="description-container my-12">
          <p className="text-xl font-normal">
            Organisez vos cours, suivez leur déroulement et laissez l'IA gérer
            automatiquement les tâches répétitives comme les rappels, les
            évaluations et les rapports de progression pour vous concentrer sur
            ce qui compte vraiment : vos étudiants.
          </p>
        </div>

        <div className="CTA-section text-xl w-full text-white">
          <Button
            type="button"
            label="Reservez une démo"
            className="w-[513px] h-[78px]"
          />
        </div>
      </div>
    </section>
    {/* Section des fonctionnalités */}
    <section className="py-20 px-12 bg-white">
      <div className="px-12">
        <div className="grid md:grid-cols-2 gap-12 space-y-16">
          {/* Programmation automatisée */}
          <div className="space-y-4">
            <h3 className="text-3xl font-medium">
              Programmation automatisée de l'emploi du temps
            </h3>
            <p className="leading-relaxed text-xl">
              Créez et modifiez rapidement vos cours et sessions, avec la
              possibilité d'attribuer facilement salles et groupes d'étudiants,
              pour un planning clair sans prise de tête.
            </p>
          </div>

          {/* Gestion simplifiée */}
          <div className="space-y-4 w-full">
            <h3 className="text-3xl font-medium">
              Gestion simplifiée des cours et plannings
            </h3>
            <p className="leading-relaxed text-xl">
              Planifiez à l'avance l'envoi des modules ou documents aux
              étudiants : une fois programmé, le système distribue
              automatiquement les cours à la date prévue, sans intervention
              manuelle.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="my-4 w-full">
          <h3 className="text-3xl font-medium mb-4">
            Notifications ciblées et programmées pour les étudiants
          </h3>
          <p className="text-xl leading-relaxed w-full">
            Envoyez des rappels ou annonces personnalisées à des groupes
            spécifiques d'étudiants selon le calendrier, pour garantir leur
            engagement et réduire les absences.
          </p>
        </div>
      </div>
    </section>
    <TestimonialsSection/>
    <FeatureRevSection/>

      <div className="first-container py-24 px-44 flex-col justify-center items-center text-center bg-profondeur">
        <div className="title-container">
          <h2 className="sub-title text-6xl leading-[110%] text-white mb-12 font-medium">
            Bénéficiez d'une assistance locale 7j/7, étendez vos formations aux zones les plus reculées et participez à l'innovation technologique de l'éducation africaine.
          </h2>
        </div>

        <div className="CTA-section text-xl w-full">
          <Button
            type="button"
            label="Lancez vous gratuitement"
            className="w-[513px] h-[78px] bg-white text-[#0060EB]"
          />
        </div>
      </div>

  </>
);

export default Subherothree;
