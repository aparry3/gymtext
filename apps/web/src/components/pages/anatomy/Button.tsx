'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
  disabled = false
}) => {
  const baseStyles = "inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
    outline: "border border-white text-white hover:bg-white hover:text-black"
  };

  const widthClass = fullWidth ? "w-full" : "";
  const combinedClasses = `${baseStyles} ${variants[variant]} ${widthClass} ${className}`;

  if (href) {
    const isExternal = href.startsWith('http');
    return (
      <a
        href={href}
        className={combinedClasses}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClasses} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
