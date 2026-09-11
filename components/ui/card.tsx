import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-surface p-5 shadow-card",
        className
      )}
      style={{ borderColor: "var(--border)", ...props.style }}
      {...props}
    />
  );
}
