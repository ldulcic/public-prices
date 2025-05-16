import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price in euros
 * @param price The price to format
 * @returns Formatted price string with euro symbol
 */
export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`
}
