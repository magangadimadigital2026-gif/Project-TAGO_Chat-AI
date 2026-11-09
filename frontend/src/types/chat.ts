// Data rekomendasi makanan
export type Rec = {
  name: string;
  reason: string;
  imageUrl?: string;
  address?: string;
  distanceKm?: number;
  etaMinutes?: number;
  menu?: string[];
};

// pesan yang tampil di chat
export type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  recs?: Rec[];
  failed?: boolean;
};
