import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateOrderCode() {
    // Format: DC-MMDD-XXXX (Month+Day - Random 4 chars)
    // Example: DC-0226-A1B2
    const now = new Date()
    const dateStr = (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `DC-${dateStr}-${random}`
}
