import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    const variants: Record<string, string> = {
      default: "bg-[var(--color-t4c-black)] text-white hover:bg-[var(--color-t4c-green)] border border-[var(--color-t4c-black)]",
      outline: "bg-white border border-[#E2E8F0] hover:border-[var(--color-t4c-green)] text-[var(--color-t4c-black)]",
      ghost: "bg-transparent hover:bg-neutral-50 text-[var(--color-t4c-black)]",
    };
    const sizes: Record<string, string> = {
      default: "h-10 px-6 py-2 rounded-[6px] text-sm",
      sm: "h-8 px-4 rounded-[6px] text-xs",
      lg: "h-12 px-8 rounded-[6px] text-base",
    };
    return <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
  }
);
Button.displayName = "Button";
