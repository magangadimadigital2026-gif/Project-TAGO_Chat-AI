import { restaurants } from "../data/restaurants.js";

// Foto tempat makan diambil dari Google Places API (New) memakai placeId.
// Tanpa GOOGLE_MAPS_API_KEY fitur ini mati dan imageUrl tetap null.
// PLACES_API_BASE hanya untuk pengujian, biarkan kosong di penggunaan normal.
const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";
const apiBase =
  process.env.PLACES_API_BASE ?? "https://places.googleapis.com/v1";

const TIMEOUT_MS = 2500; // batas total per tempat, supaya chat tidak tertahan lama
const HIT_TTL_MS = 30 * 60 * 1000; // foto berhasil disimpan sebentar (30 menit)
const MISS_TTL_MS = 10 * 60 * 1000; // gagal disimpan lebih singkat, supaya tidak memanggil terus
const PHOTO_SIZE_PX = 600;

type Photo = { url: string | null; credit: string | null };
const EMPTY: Photo = { url: null, credit: null };

const cache = new Map<string, { photo: Photo; expires: number }>();
const pending = new Map<string, Promise<Photo>>();

// Nama foto dari Google berbentuk places/<id>/photos/<ref>. Pola lain ditolak.
const PHOTO_NAME = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

type DetailResponse = {
  photos?: { name?: string; authorAttributions?: { displayName?: string }[] }[];
};
type MediaResponse = { photoUri?: string };

async function requestPhoto(placeId: string): Promise<Photo> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  // 1) Minta daftar foto tempat itu. API key dikirim lewat header, bukan di URL.
  const detail = await fetch(
    `${apiBase}/places/${encodeURIComponent(placeId)}`,
    {
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "photos" },
      signal,
    },
  );
  if (!detail.ok) {
    console.log(`places detail status=${detail.status}`);
    return EMPTY;
  }

  const first = ((await detail.json()) as DetailResponse).photos?.[0];
  if (!first?.name || !PHOTO_NAME.test(first.name)) return EMPTY;

  // 2) Minta alamat gambar untuk foto pertama.
  const media = await fetch(
    `${apiBase}/${first.name}/media?maxWidthPx=${PHOTO_SIZE_PX}&maxHeightPx=${PHOTO_SIZE_PX}&skipHttpRedirect=true`,
    { headers: { "X-Goog-Api-Key": apiKey }, signal },
  );
  if (!media.ok) {
    console.log(`places photo status=${media.status}`);
    return EMPTY;
  }

  const photoUri = ((await media.json()) as MediaResponse).photoUri;
  if (typeof photoUri !== "string" || !photoUri.startsWith("https://"))
    return EMPTY;

  const author = first.authorAttributions?.[0]?.displayName?.trim();
  return {
    url: photoUri,
    credit: author ? `Foto: ${author} (Google Maps)` : "Foto: Google Maps",
  };
}

async function getPhoto(placeId: string): Promise<Photo> {
  const cached = cache.get(placeId);
  if (cached && cached.expires > Date.now()) return cached.photo;

  // Beberapa pesan bersamaan untuk tempat yang sama hanya memanggil Google sekali.
  const running = pending.get(placeId);
  if (running) return running;

  const job = (async () => {
    let photo = EMPTY;
    try {
      photo = await requestPhoto(placeId);
    } catch {
      console.log("places photo timeout/error");
    }
    cache.set(placeId, {
      photo,
      expires: Date.now() + (photo.url ? HIT_TTL_MS : MISS_TTL_MS),
    });
    return photo;
  })().finally(() => pending.delete(placeId));

  pending.set(placeId, job);
  return job;
}

// Mengisi imageUrl dan imageCredit pada daftar rekomendasi. Tidak pernah melempar error:
// kalau foto gagal diambil, imageUrl dibiarkan apa adanya dan imageCredit null.
export async function attachPhotos<
  T extends { id: number; imageUrl: string | null },
>(recommendations: T[]): Promise<(T & { imageCredit: string | null })[]> {
  return Promise.all(
    recommendations.map(async (rec) => {
      const placeId = restaurants.find((r) => r.id === rec.id)?.placeId;
      if (!apiKey || !placeId) return { ...rec, imageCredit: null };

      const photo = await getPhoto(placeId);
      return {
        ...rec,
        imageUrl: photo.url ?? rec.imageUrl,
        imageCredit: photo.url ? photo.credit : null,
      };
    }),
  );
}
