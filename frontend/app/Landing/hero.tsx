import Image from "next/image";
import Button from "../components/ui/Button";

// Composant Navbar pour ma landingPage
const Hero = () => (
  <div className="hero-section">
    <div className="hero-container px-25 pt-50 pb-25">
      <div className="hero-right-section w-[60%]">
        <div className="title-container mb-7">
          <h1 className="text-7xl leading-[110%] font-medium">
            <span className="text-orange-500">Simplifiez par 5</span> la gestion pédagogique <br />de votre centre de formation.
          </h1>
        </div>

        <div className="description-container mb-7">
          <p className="text-xl">
            Centralisez la gestion de vos étudiants cours et évaluations dans
            une solution intuitive qui évolue avec votre école et vous permet de
            vous concentrer pleinement sur la qualité de vos formations plutôt
            que sur les tâches administratives.
          </p>
        </div>

        <div className="CTA-section text-lg text-white">
            <Button type="button" label="Essayez gratuitement"/>
        </div>
      </div>
    </div>
  </div>
);

export default Hero;
