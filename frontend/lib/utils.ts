import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui-style class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
