export type MenuItem = {
  nama: string;
  harga: number;
  kategori: "makanan" | "minuman";
};

export type Restaurant = {
  id: number;
  nama: string;
  alamat: string;
  jarakKm: number;
  estimasiMenit: number;
  menu: MenuItem[];
};

export const restaurants: Restaurant[] = [
  {
    id: 1,
    nama: "Warung Sari Rasa",
    alamat: "Jl. Mawar No. 12",
    jarakKm: 0.8,
    estimasiMenit: 3,
    menu: [
      { nama: "Nasi Pecel", harga: 12000, kategori: "makanan" },
      { nama: "Soto Ayam", harga: 15000, kategori: "makanan" },
      { nama: "Es Teh Manis", harga: 4000, kategori: "minuman" },
    ],
  },
  {
    id: 2,
    nama: "Depot Bu Lastri",
    alamat: "Jl. Melati No. 5",
    jarakKm: 1.5,
    estimasiMenit: 6,
    menu: [
      { nama: "Rawon", harga: 20000, kategori: "makanan" },
      { nama: "Nasi Rames", harga: 14000, kategori: "makanan" },
      { nama: "Es Jeruk", harga: 5000, kategori: "minuman" },
    ],
  },
  {
    id: 3,
    nama: "Bakso Pak Haji",
    alamat: "Jl. Kenanga No. 21",
    jarakKm: 2.3,
    estimasiMenit: 9,
    menu: [
      { nama: "Bakso Urat", harga: 17000, kategori: "makanan" },
      { nama: "Mie Ayam", harga: 13000, kategori: "makanan" },
      { nama: "Es Campur", harga: 8000, kategori: "minuman" },
    ],
  },
  {
    id: 4,
    nama: "Ayam Geprek Mantap",
    alamat: "Jl. Anggrek No. 8",
    jarakKm: 3.1,
    estimasiMenit: 12,
    menu: [
      { nama: "Ayam Geprek", harga: 16000, kategori: "makanan" },
      { nama: "Nasi Goreng Spesial", harga: 18000, kategori: "makanan" },
      { nama: "Jus Alpukat", harga: 10000, kategori: "minuman" },
    ],
  },
  {
    id: 5,
    nama: "Kedai Kopi Senja",
    alamat: "Jl. Dahlia No. 3",
    jarakKm: 4.2,
    estimasiMenit: 15,
    menu: [
      { nama: "Roti Bakar Cokelat", harga: 12000, kategori: "makanan" },
      { nama: "Kopi Susu", harga: 15000, kategori: "minuman" },
      { nama: "Teh Tarik", harga: 12000, kategori: "minuman" },
    ],
  },
];
