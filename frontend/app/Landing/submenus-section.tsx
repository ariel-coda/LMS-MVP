"use client"
import { useEffect, useRef, useState } from "react";

const Submenus = () => {
  const [topValue, setTopValue] = useState("top-10");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY.current) < 5) return; // seuil anti-tremblement

      if (currentScrollY > lastScrollY.current) {
        // scroll vers le bas
        setTopValue("top-10"); 
      } else {
        // scroll vers le haut
        setTopValue("top-[100px]");
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`Submenus sticky ${topValue} transition-all duration-300 z-20`}>
      <div className="submenus-container flex items-center justify-center">
        <ul className="submenus-lists shadow-lg border border-gray-200 flex items-center gap-2.5 p-3 m-3 rounded-full bg-white/70 backdrop-blur-md">
          <li className="px-5 py-4 text-white bg-orange-500 rounded-full">
            <a href="">Vos données au même endroit</a>
          </li>
          <li className="submenu">
            <a href="">Un suivi étudiant de qualité</a>
          </li>
          <li className="submenu">
            <a href="">L'automatisation, l'IA et vous</a>
          </li>
          <li className="submenu">
            <a href="">Une application conçue pour vous</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Submenus;
