import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Hợp nhất các class Tailwind CSS an toàn và chống xung đột
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
