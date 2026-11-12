// Format tampilan untuk harga dan menu
import type { MenuItem } from "../types/chat";

// Mengubah angka menjadi rupiah, contoh 12500 menjadi Rp12.500
export const rupiah = (n: number) =>
  "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Makanan didahulukan, minuman di belakang
const foodFirst = (menu: MenuItem[]) => [
  ...menu.filter((m) => m.category !== "minuman"),
  ...menu.filter((m) => m.category === "minuman"),
];

// Ringkasan menu lengkap dengan harga, maksimal limit item
export function menuSummary(menu: MenuItem[], limit = 3): string {
  return foodFirst(menu)
    .slice(0, limit)
    .map((m) => (m.price !== undefined ? `${m.name} ${rupiah(m.price)}` : m.name))
    .join(", ");
}

// Mengelompokkan menu: Makanan dan Minuman, atau satu kelompok Menu jika tidak ada minuman
export function groupMenu(menu: MenuItem[]): { title: string; items: MenuItem[] }[] {
  const foods = menu.filter((m) => m.category !== "minuman");
  const drinks = menu.filter((m) => m.category === "minuman");
  if (!drinks.length) return foods.length ? [{ title: "Menu", items: foods }] : [];
  if (!foods.length) return [{ title: "Menu", items: drinks }];
  return [
    { title: "Makanan", items: foods },
    { title: "Minuman", items: drinks },
  ];
}
