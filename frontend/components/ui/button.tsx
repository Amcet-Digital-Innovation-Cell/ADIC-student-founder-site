import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" && "bg-champagne-gold text-black-leather border border-champagne-gold hover:bg-[var(--color-champagne-dark)] hover:border-[var(--color-champagne-dark)]",
        variant === "secondary" && "bg-transparent text-champagne-gold border border-champagne-gold hover:bg-[rgba(184,149,104,0.10)]",
        variant === "ghost" && "bg-transparent text-black-leather border-transparent hover:bg-[rgba(17,17,17,0.05)]",
        variant === "outline" && "border border-[var(--border)] bg-surface text-black-leather hover:border-[var(--border-strong)] shadow-sm",
        className
      )}
      {...props}
    />
  );
}
