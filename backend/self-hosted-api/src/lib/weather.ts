const apiBase =
  process.env.WEATHER_API_BASE ?? "https://api.openweathermap.org/data/2.5";

const TIMEOUT_MS = 3000;
const CACHE_TTL_MS = 10 * 60 * 1000; // cuaca jarang berubah, simpan 10 menit

export type WeatherData = {
  description: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  city: string;
  icon: string;
  iconUrl: string;
};

const cache = new Map<string, { data: WeatherData; expires: number }>();

// Data cuaca terstruktur untuk endpoint /api/weather. Mengembalikan null kalau gagal.
export async function getWeatherData(
  lat: number,
  lon: number,
): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) return null;

  // Koordinat dibulatkan (±1 km) supaya pengguna berdekatan memakai cache yang sama.
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.data;

  try {
    const res = await fetch(
      `${apiBase}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    if (!res.ok) return null;

    const raw = (await res.json()) as {
      weather?: { description?: string; icon?: string }[];
      main?: { temp?: number; feels_like?: number; humidity?: number };
      name?: string;
    };

    const w = raw.weather?.[0];
    if (!w?.description || typeof raw.main?.temp !== "number") return null;

    const icon = w.icon ?? "";
    const data: WeatherData = {
      description: w.description,
      tempC: Math.round(raw.main.temp),
      feelsLikeC: Math.round(raw.main.feels_like ?? raw.main.temp),
      humidity: raw.main.humidity ?? 0,
      city: raw.name ?? "",
      icon,
      iconUrl: icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : "",
    };

    cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
    return data;
  } catch {
    return null;
  }
}

// Kalimat cuaca untuk konteks AI di /api/chat. Perilakunya sama seperti sebelumnya.
export async function getWeather(lat: number, lon: number): Promise<string> {
  const data = await getWeatherData(lat, lon);
  if (!data) return "";
  return `Cuaca saat ini: ${data.description}, suhu ${data.tempC}°C.`;
}
