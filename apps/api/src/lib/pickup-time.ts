const INDIA_OFFSET_MS = 330 * 60_000;
const DAY_MS = 24 * 60 * 60_000;

export function storeDate(now = new Date()) {
  return new Date(Math.floor((now.getTime() + INDIA_OFFSET_MS) / DAY_MS) * DAY_MS);
}

export function pickupMinutes(time: string): number | null {
  const match = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)?$/i.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem && (hours < 1 || hours > 12)) return null;
  if (!meridiem && hours > 23) return null;
  return (meridiem ? hours % 12 + (meridiem === "PM" ? 12 : 0) : hours) * 60 + Number(match[2]);
}

export function isBookablePickup(slot: { date: Date; endTime: string; isActive: boolean }, now = new Date()) {
  if (!slot.isActive || slot.date < storeDate(now)) return false;
  const end = pickupMinutes(slot.endTime);
  return end !== null && slot.date.getTime() + end * 60_000 - INDIA_OFFSET_MS > now.getTime();
}
