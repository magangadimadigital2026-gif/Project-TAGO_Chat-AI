// Alamat pencarian Google Maps dari nama dan alamat restoran
export const mapsUrl = (name: string, address?: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [name, address].filter(Boolean).join(" ")
  )}`;
