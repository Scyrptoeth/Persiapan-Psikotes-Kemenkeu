import { CATEGORY_SLUGS, type CategorySlug, type Operation } from "@/lib/types";

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  tambah: "Tambah",
  kurang: "Kurang",
  kali: "Kali",
  bagi: "Bagi",
  mix: "Mix",
};

export const OPERATION_LABELS: Record<Operation, string> = {
  add: "Tambah",
  subtract: "Kurang",
  multiply: "Kali",
  divide: "Bagi",
};

export const OPERATION_SYMBOLS: Record<Operation, string> = {
  add: "+",
  subtract: "-",
  multiply: "x",
  divide: "÷",
};

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORY_SLUGS.includes(value as CategorySlug);
}

export function formatMathNumber(value: number): string {
  const rounded = roundToTwo(value);
  if (Number.isInteger(rounded)) {
    return `${rounded}`;
  }

  return rounded
    .toFixed(2)
    .replace(/0+$/, "")
    .replace(/\.$/, "")
    .replace(".", ",");
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizePhone(rawPhone: string): string {
  const trimmed = rawPhone.trim().replace(/[\s()-]/g, "");
  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  if (trimmed.startsWith("0")) {
    return `+62${trimmed.slice(1)}`;
  }

  if (trimmed.startsWith("62")) {
    return `+${trimmed}`;
  }

  return trimmed;
}

