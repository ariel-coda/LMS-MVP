import Navbar from "../components/layout/Navbar";
import Hero from "./hero";
import Submenus from "./submenus-section";
import Subheroone from "./Subhero-one";
import Subherotwo from "./Subhero-two";
import Subherothree from "./Subhero-three";

const LandingPage = () => {
return (
    <>
      <Navbar />
      <Hero/>
      <Submenus/>
      <Subheroone/>
      <Subherotwo/>
      <Subherothree/>
    </>
  );
}

export default LandingPage