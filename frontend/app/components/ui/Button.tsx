import React from "react";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string; // Ajout de la prop className
};

const Button: React.FC<ButtonProps> = ({ label, onClick, type = "button", className }) => {
  const defaultClass = "px-5 py-4 bg-[#121212] cursor-pointer hover:bg-[#000] hover:text-white transition rounded-lg";
  return (
    <button
      type={type}
      onClick={onClick}
      className={className ? `${defaultClass} ${className}` : defaultClass}
    >
      {label}
    </button>
  );
};

export default Button
