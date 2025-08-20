import React from "react";

interface InputProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  label: string;
  className?: string;
  error?: string;
  isValid?: boolean;
}

const Input: React.FC<InputProps> = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  placeholder,
  label,
  className = "",
  error,
  isValid,
}) => {
  const getBorderColor = () => {
    if (error) return "border-red-400";
    if (isValid) return "border-green-400";
    return "";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label htmlFor={id} className="block text-xl font-semibold">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        className={`w-full px-6 py-4 text-lg border-2 ${getBorderColor()} rounded-sm outline-none transition-all duration-200`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;