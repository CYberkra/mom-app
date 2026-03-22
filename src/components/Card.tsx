"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  padding?: "none" | "small" | "medium" | "large";
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  subtitle,
  icon,
  className = "",
  padding = "medium",
  hoverable = false,
  clickable = false,
  onClick,
}: CardProps) {
  const paddingClasses = {
    none: "",
    small: "p-3",
    medium: "p-4",
    large: "p-6",
  };

  const hoverClass = hoverable || clickable
    ? "transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
    : "";
  const clickableClass = clickable ? "cursor-pointer" : "";

  return (
    <div
      className={`card ${paddingClasses[padding]} ${hoverClass} ${clickableClass} ${className}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === "Enter" && onClick?.() : undefined}
    >
      {(title || icon) && (
        <div className="flex items-start gap-3 mb-3">
          {icon && <div className="text-2xl text-primary">{icon}</div>}
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}