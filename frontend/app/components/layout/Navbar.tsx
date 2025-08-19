"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "../ui/Button";

const NAVBAR_HEIGHT = 100;

const Navbar = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Détermine si on a scrollé assez pour fixer la navbar
      setIsScrolled(currentScrollY > 50);

      // Logique pour montrer/cacher la navbar
      if (currentScrollY < 50) {
        // Toujours visible en haut de page
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scroll vers le bas - cacher la navbar
        setIsVisible(false);
        setIsMobileMenuOpen(false); // Fermer le menu mobile si ouvert
      } else {
        // Scroll vers le haut - montrer la navbar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      style={{ height: NAVBAR_HEIGHT }}
      className={`w-full z-50 fixed top-0 left-0 duration-300
    ${isVisible ? "translate-y-0" : "-translate-y-full"} 
    bg-white/50 backdrop-blur-md
  `}
  
    >
      <div className="nav-container flex justify-between items-center px-6 md:px-25 h-full">
        <div className="logo-section flex-shrink-0 h-full flex items-center">
          <div
            className={`transition-transform duration-300 ${
              isScrolled ? "scale-100" : "scale-100"
            }`}
          >
            <Image
              className="cursor-pointer"
              src="/logo/Qwish.png"
              alt="Qwish logo"
              width={120}
              height={46}
              priority
            />
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="menu-section hidden md:block">
          <ul className="list-menu flex gap-6 lg:gap-8 items-center">
            <li
              className={`
              font-normal transition-all duration-300
            `}
            >
              <Link
                href="../../"
                className="hover:text-blue-600 transition-colors duration-200 relative group active"
              >
                Notre solution
              </Link>
            </li>
            <li
              className={`
              font-normal transition-all duration-300
            `}
            >
              <a
                href="#"
                className="hover:text-blue-600 transition-colors duration-200 relative group"
              >
                A propos de nous
              </a>
            </li>
            <li className="transform transition-transform duration-300 text-white">
              <Button
                type="button"
                label="Commencer un essai gratuit"
                onClick={() => router.push("/Formulaire")}
              />
            </li>
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className={`
              relative w-8 h-8 flex flex-col justify-center items-center
              transition-all duration-300 focus:outline-none
            `}
            aria-label="Menu"
          >
            <span
              className={`
              block w-6 h-0.5 bg-current transition-all duration-300 transform
              ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}
            `}
            ></span>
            <span
              className={`
              block w-6 h-0.5 bg-current transition-all duration-300 mt-1
              ${isMobileMenuOpen ? "opacity-0" : ""}
            `}
            ></span>
            <span
              className={`
              block w-6 h-0.5 bg-current transition-all duration-300 mt-1 transform
              ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}
            `}
            ></span>
          </button>
        </div>
      </div>

      {/* Overlay pour fermer le menu mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 -z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
