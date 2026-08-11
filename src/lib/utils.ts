import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(value: number | string | { toString(): string }) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

export function dateTime(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function makeOrderNumber(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `LAV-${stamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}
