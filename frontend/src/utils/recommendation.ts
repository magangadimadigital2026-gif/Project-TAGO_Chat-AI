// Mengubah data rekomendasi dari backend menjadi bentuk Rec
import type { MenuItem, Rec } from "../types/chat";

// Data mentah dari backend, nama field bisa Inggris atau Indonesia
export type RawRec = Record<string, unknown>;

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

// Menu bisa berupa teks atau objek berisi nama, harga, dan kategori
function toMenuItem(m: unknown): MenuItem | undefined {
  if (typeof m === "string") return m.trim() ? { name: m } : undefined;
  const o = (m ?? {}) as RawRec;
  const name = text(o.nama) ?? text(o.name);
  if (!name) return undefined;
  return {
    name,
    price: num(o.harga) ?? num(o.price),
    category: text(o.kategori) ?? text(o.category),
  };
}

// Menyesuaikan data satu restoran dari backend ke bentuk Rec
// Mengganti nama field, memeriksa tipe data, dan memberi nilai bawaan
export function toRec(raw: RawRec): Rec {
  const menu = Array.isArray(raw.menu)
    ? raw.menu.map(toMenuItem).filter((m): m is MenuItem => !!m)
    : [];

  return {
    name: text(raw.name) ?? text(raw.nama) ?? "Tanpa nama",
    reason: text(raw.reason) ?? "",
    imageUrl: text(raw.imageUrl),
    address: text(raw.address) ?? text(raw.alamat),
    distanceKm: num(raw.distanceKm) ?? num(raw.jarakKm),
    etaMinutes: num(raw.etaMinutes) ?? num(raw.estimasiMenit),
    menu: menu.length ? menu : undefined,
  };
}

// Menyesuaikan daftar restoran dari backend ke daftar Rec
// Jika datanya kosong atau bukan daftar, hasilnya daftar kosong
export const toRecs = (list: unknown): Rec[] =>
  Array.isArray(list) ? list.map((r) => toRec(r as RawRec)) : [];
