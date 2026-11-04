import type { Rec } from "../services/chat";

// Satu pesan yang tampil di layar chat
export type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  recs?: Rec[];
  failed?: boolean;
};
