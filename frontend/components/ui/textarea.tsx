import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full resize-none rounded-md border bg-surface px-3 py-2 text-sm outline-none transition-all duration-200",
        "placeholder:text-[var(--color-muted-taupe)]",
        "focus:border-[var(--color-champagne-gold)] focus:ring-2 focus:ring-[rgba(184,149,104,0.12)]",
        "hover:border-[var(--border-strong)]",
        className
      )}
      style={{ borderColor: "var(--border)", color: "var(--color-black-leather)", ...props.style }}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
