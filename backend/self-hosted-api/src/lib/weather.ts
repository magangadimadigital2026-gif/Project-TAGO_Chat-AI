export async function getWeather(lat: number, lon: number): Promise<string> {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) return "";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`,
    );

    if (!res.ok) return "";

    const data = (await res.json()) as {
      weather: { description: string }[];
      main: { temp: number };
    };

    return `Cuaca saat ini: ${data.weather[0].description}, suhu ${Math.round(data.main.temp)}°C.`;
  } catch {
    return "";
  }
}
