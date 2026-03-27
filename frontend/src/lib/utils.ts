import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDate(date: string | Date): string {
  // If the date string from Supabase lacks timezone info, append 'Z' to force UTC evaluation
  const dateStr = typeof date === 'string' && !date.endsWith('Z') && !date.includes('+') ? date + 'Z' : date;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateEncryptionKey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function encryptMessage(message: string, key: string): Promise<string> {
  // Simple XOR encryption for demo - use proper encryption in production
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const keyBytes = encoder.encode(key);

  const encrypted = Array.from(data).map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
  return btoa(String.fromCharCode(...encrypted));
}

export async function decryptMessage(encrypted: string, key: string): Promise<string> {
  // Simple XOR decryption for demo - use proper encryption in production
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(key);

  const data = atob(encrypted);
  const decrypted = data.split('').map((char, i) =>
    char.charCodeAt(0) ^ keyBytes[i % keyBytes.length]
  );

  return new TextDecoder().decode(new Uint8Array(decrypted));
}
