const pad = (n: number) => String(n).padStart(2, "0");

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

// Hari ini / kemarin -> jam (HH.MM), selain itu -> tanggal (DD/MM)
export function timeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now) || isSameDay(date, yesterday)) {
    return `${pad(date.getHours())}.${pad(date.getMinutes())}`;
  }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}
