// Tipe data rekomendasi dan pesan di layar chat

// Satu menu makanan atau minuman
export type MenuItem = {
  name: string;
  price?: number;
  category?: string;
};

// Data rekomendasi makanan
export type Rec = {
  name: string;
  reason: string;
  imageUrl?: string;
  address?: string;
  distanceKm?: number;
  etaMinutes?: number;
  menu?: MenuItem[];
};

// Satu pesan yang tampil di layar chat
export type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  recs?: Rec[];
  failed?: boolean;
};
