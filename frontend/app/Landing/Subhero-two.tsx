import Image from "next/image";
import Button from "../components/ui/Button";
import FeatureSection from "./Features";

const Subherotwo = () => (
  <div className="Sub-hero">
    <div className="first-container py-42 px-44 flex-col justify-center items-center text-center">
      <div className="title-container">
        <h2 className="sub-title text-6xl leading-[110%] font-medium">
          Investissez désormais la majorité de votre temps dans le succès de vos
          étudiants.
        </h2>
      </div>

      <div className="description-container my-12">
        <p className="text-xl font-normal">
          Offrez à vos étudiants un encadrement plus riche sans alourdir votre
          quotidien. Notre service vous permet de vous concentrer davantage sur
          l’accompagnement et le suivi pédagogique, en diminuant les efforts
          consacrés à la gestion quotidienne. Vous gagnez en disponible, en
          qualité et en impact éducatif sans complexifier vos outils actuels.
        </p>
      </div>

      <div className="CTA-section text-xl w-full text-white">
        <Button
          type="button"
          label="Testez gratuitement"
          className="w-[513px] h-[78px]"
        />
      </div>

      <FeatureSection/>

    </div>
  </div>
);

export default Subherotwo;
