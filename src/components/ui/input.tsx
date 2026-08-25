import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = "", type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-[6px] border border-[#E2E8F0] bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[var(--color-t4c-green)] focus:ring-1 focus:ring-[var(--color-t4c-green)] disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
