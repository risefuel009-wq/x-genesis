import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function guaranteeLabel(days: number): string {
  if (days === 30) return 'شهر';
  if (days === 21) return '3 أسابيع';
  if (days === 14) return 'أسبوعين';
  if (days === 45) return '45 يوم';
  return `${days} يوم`;
}

export const LEVEL_RANK: Record<string, number> = {
  A1: 0, A2: 1, B1: 2, 'B1+': 3,
  B2: 4, 'B2+': 5, C1: 6, C2: 7,
};

export function levelGte(a: string, b: string): boolean {
  return (LEVEL_RANK[a] ?? 0) >= (LEVEL_RANK[b] ?? 0);
}

export function generateTrackingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'XG-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function isValidEgyptianPhone(phone: string): boolean {
  return /^01[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

export function isValidVocarooUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?voca\.ro\/\S+$/i.test(url.trim());
}

export function filterOffersForCandidate(
  offers: any[],
  candidate: {
    age: number;
    language: string;
    level: string;
    gradStatus: string;
  }
) {
  return offers.filter((offer) => {
    if (offer.language !== candidate.language) return false;
    const age = candidate.age;
    if (age && (age < offer.min_age || age > offer.max_age)) return false;
    if (!levelGte(candidate.level, offer.min_language_level)) return false;
    if (!offer.accepts_students && candidate.gradStatus === 'undergrad') return false;
    return true;
  });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export const STAGE_LABELS: Record<string, string> = {
  new: 'جديد',
  screening: 'مراجعة',
  interview: 'إنترفيو',
  hired: 'تم التوظيف',
  rejected: 'مرفوض',
};

export const STAGE_COLORS: Record<string, string> = {
  new: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  screening: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  interview: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  hired: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};
