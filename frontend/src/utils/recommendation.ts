// Mengubah data rekomendasi dari backend menjadi bentuk Rec
import type { Rec } from "../types/chat";

// Data mentah dari backend, nama field bisa Inggris atau Indonesia
export type RawRec = Record<string, unknown>;

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

// Menu bisa berupa teks atau objek yang punya nama
const menuName = (m: unknown) =>
  typeof m === "string" ? m : text((m as RawRec | null)?.nama) ?? text((m as RawRec | null)?.name);

// Menyesuaikan data satu restoran dari backend ke bentuk Rec
// Mengganti nama field, memeriksa tipe data, dan memberi nilai bawaan
export function toRec(raw: RawRec): Rec {
  const menu = Array.isArray(raw.menu)
    ? raw.menu.map(menuName).filter((m): m is string => !!m)
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
