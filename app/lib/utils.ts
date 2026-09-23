// cn() utility — joins class strings, filters falsy values.
// ClassValue from class-variance-authority is accepted via the unknown overload.
// Swap body for: import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge';
// return twMerge(clsx(inputs))   — once those packages are installed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cn(...inputs: any[]): string {
  return inputs.flat().filter(Boolean).join(' ')
}
