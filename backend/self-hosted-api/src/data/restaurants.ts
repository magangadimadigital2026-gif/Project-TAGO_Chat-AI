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
    jarakKm: 0.4,
    estimasiMenit: 2,
    menu: [
      { nama: "Nasi Pecel", harga: 12000, kategori: "makanan" },
      { nama: "Soto Ayam", harga: 15000, kategori: "makanan" },
      { nama: "Tempe Penyet", harga: 11000, kategori: "makanan" },
      { nama: "Es Teh Manis", harga: 4000, kategori: "minuman" },
      { nama: "Teh Hangat", harga: 3000, kategori: "minuman" },
    ],
  },
  {
    id: 2,
    nama: "Kantin Pojok Kampus",
    alamat: "Jl. Pendidikan No. 1",
    jarakKm: 0.7,
    estimasiMenit: 3,
    menu: [
      { nama: "Nasi Goreng Telur", harga: 13000, kategori: "makanan" },
      { nama: "Mie Goreng Jawa", harga: 14000, kategori: "makanan" },
      { nama: "Kwetiau Siram", harga: 16000, kategori: "makanan" },
      { nama: "Es Jeruk", harga: 5000, kategori: "minuman" },
      { nama: "Susu Cokelat", harga: 7000, kategori: "minuman" },
    ],
  },
  {
    id: 3,
    nama: "Depot Bu Lastri",
    alamat: "Jl. Melati No. 5",
    jarakKm: 1.1,
    estimasiMenit: 4,
    menu: [
      { nama: "Rawon", harga: 20000, kategori: "makanan" },
      { nama: "Nasi Rames", harga: 14000, kategori: "makanan" },
      { nama: "Pecel Lele", harga: 17000, kategori: "makanan" },
      { nama: "Es Jeruk", harga: 5000, kategori: "minuman" },
      { nama: "Wedang Jahe", harga: 6000, kategori: "minuman" },
    ],
  },
  {
    id: 4,
    nama: "Bakso Pak Haji",
    alamat: "Jl. Kenanga No. 21",
    jarakKm: 1.5,
    estimasiMenit: 6,
    menu: [
      { nama: "Bakso Urat", harga: 17000, kategori: "makanan" },
      { nama: "Bakso Telur", harga: 18000, kategori: "makanan" },
      { nama: "Mie Ayam", harga: 13000, kategori: "makanan" },
      { nama: "Es Campur", harga: 8000, kategori: "minuman" },
      { nama: "Es Teh Tawar", harga: 3000, kategori: "minuman" },
    ],
  },
  {
    id: 5,
    nama: "Ayam Geprek Mantap",
    alamat: "Jl. Anggrek No. 8",
    jarakKm: 1.9,
    estimasiMenit: 7,
    menu: [
      { nama: "Ayam Geprek Level 1", harga: 16000, kategori: "makanan" },
      { nama: "Ayam Geprek Level 5", harga: 17000, kategori: "makanan" },
      { nama: "Nasi Goreng Spesial", harga: 18000, kategori: "makanan" },
      { nama: "Jus Alpukat", harga: 10000, kategori: "minuman" },
      { nama: "Es Lemon Tea", harga: 6000, kategori: "minuman" },
    ],
  },
  {
    id: 6,
    nama: "Sate Madura Cak Imam",
    alamat: "Jl. Veteran No. 33",
    jarakKm: 2.3,
    estimasiMenit: 9,
    menu: [
      { nama: "Sate Ayam 10 Tusuk", harga: 25000, kategori: "makanan" },
      { nama: "Sate Kambing 10 Tusuk", harga: 35000, kategori: "makanan" },
      { nama: "Gulai Kambing", harga: 30000, kategori: "makanan" },
      { nama: "Es Kelapa Muda", harga: 9000, kategori: "minuman" },
      { nama: "Teh Poci", harga: 5000, kategori: "minuman" },
    ],
  },
  {
    id: 7,
    nama: "Nasi Goreng Kambing Kebon Sirih",
    alamat: "Jl. Kebon Sirih No. 14",
    jarakKm: 2.6,
    estimasiMenit: 10,
    menu: [
      { nama: "Nasi Goreng Kambing", harga: 24000, kategori: "makanan" },
      { nama: "Nasi Goreng Seafood", harga: 26000, kategori: "makanan" },
      { nama: "Capcay Goreng", harga: 22000, kategori: "makanan" },
      { nama: "Es Jeruk Peras", harga: 7000, kategori: "minuman" },
    ],
  },
  {
    id: 8,
    nama: "Kedai Kopi Senja",
    alamat: "Jl. Dahlia No. 3",
    jarakKm: 3.0,
    estimasiMenit: 12,
    menu: [
      { nama: "Roti Bakar Cokelat", harga: 12000, kategori: "makanan" },
      { nama: "Pisang Goreng Keju", harga: 13000, kategori: "makanan" },
      { nama: "Kentang Goreng", harga: 14000, kategori: "makanan" },
      { nama: "Kopi Susu", harga: 15000, kategori: "minuman" },
      { nama: "Teh Tarik", harga: 12000, kategori: "minuman" },
      { nama: "Cappuccino", harga: 18000, kategori: "minuman" },
    ],
  },
  {
    id: 9,
    nama: "Pizza Nusantara",
    alamat: "Jl. Diponegoro No. 40",
    jarakKm: 3.4,
    estimasiMenit: 13,
    menu: [
      { nama: "Pizza Margherita", harga: 45000, kategori: "makanan" },
      { nama: "Pizza Beef Rendang", harga: 55000, kategori: "makanan" },
      { nama: "Spaghetti Bolognese", harga: 38000, kategori: "makanan" },
      { nama: "Lemonade", harga: 12000, kategori: "minuman" },
      { nama: "Iced Chocolate", harga: 16000, kategori: "minuman" },
    ],
  },
  {
    id: 10,
    nama: "Rumah Makan Padang Sederhana Jaya",
    alamat: "Jl. Ahmad Yani No. 77",
    jarakKm: 3.8,
    estimasiMenit: 14,
    menu: [
      { nama: "Nasi Rendang", harga: 28000, kategori: "makanan" },
      { nama: "Nasi Ayam Pop", harga: 24000, kategori: "makanan" },
      { nama: "Nasi Dendeng Balado", harga: 27000, kategori: "makanan" },
      { nama: "Gulai Otak", harga: 20000, kategori: "makanan" },
      { nama: "Es Teh Manis", harga: 5000, kategori: "minuman" },
    ],
  },
  {
    id: 11,
    nama: "Ramen Kita",
    alamat: "Jl. Pahlawan No. 19",
    jarakKm: 4.2,
    estimasiMenit: 16,
    menu: [
      { nama: "Ramen Shoyu", harga: 35000, kategori: "makanan" },
      { nama: "Ramen Pedas", harga: 38000, kategori: "makanan" },
      { nama: "Chicken Katsu Don", harga: 32000, kategori: "makanan" },
      { nama: "Gyoza 5 Pcs", harga: 20000, kategori: "makanan" },
      { nama: "Ocha Dingin", harga: 8000, kategori: "minuman" },
    ],
  },
  {
    id: 12,
    nama: "Seafood Pantai Selatan",
    alamat: "Jl. Raya Pantai No. 2",
    jarakKm: 5.0,
    estimasiMenit: 18,
    menu: [
      { nama: "Udang Saus Padang", harga: 42000, kategori: "makanan" },
      { nama: "Cumi Goreng Tepung", harga: 38000, kategori: "makanan" },
      { nama: "Ikan Bakar Kakap", harga: 50000, kategori: "makanan" },
      { nama: "Kangkung Belacan", harga: 15000, kategori: "makanan" },
      { nama: "Es Kelapa Muda", harga: 9000, kategori: "minuman" },
    ],
  },
  {
    id: 13,
    nama: "Dimsum Mbak Ayu",
    alamat: "Jl. Cempaka No. 27",
    jarakKm: 5.4,
    estimasiMenit: 20,
    menu: [
      { nama: "Siomay Ayam", harga: 15000, kategori: "makanan" },
      { nama: "Hakau Udang", harga: 18000, kategori: "makanan" },
      { nama: "Bakpao Ayam", harga: 12000, kategori: "makanan" },
      { nama: "Teh Melati", harga: 6000, kategori: "minuman" },
    ],
  },
  {
    id: 14,
    nama: "Gudeg Yu Narti",
    alamat: "Jl. Slamet Riyadi No. 6",
    jarakKm: 6.1,
    estimasiMenit: 22,
    menu: [
      { nama: "Nasi Gudeg Komplit", harga: 22000, kategori: "makanan" },
      { nama: "Gudeg Krecek", harga: 18000, kategori: "makanan" },
      { nama: "Ayam Kampung Goreng", harga: 25000, kategori: "makanan" },
      { nama: "Wedang Uwuh", harga: 8000, kategori: "minuman" },
    ],
  },
  {
    id: 15,
    nama: "Warung Vegetarian Hijau",
    alamat: "Jl. Kamboja No. 11",
    jarakKm: 7.0,
    estimasiMenit: 25,
    menu: [
      { nama: "Gado-gado", harga: 15000, kategori: "makanan" },
      { nama: "Tahu Tempe Bacem", harga: 12000, kategori: "makanan" },
      { nama: "Nasi Sayur Lodeh", harga: 14000, kategori: "makanan" },
      { nama: "Salad Buah", harga: 13000, kategori: "makanan" },
      { nama: "Jus Wortel", harga: 9000, kategori: "minuman" },
      { nama: "Smoothie Pisang", harga: 12000, kategori: "minuman" },
    ],
  },
];
