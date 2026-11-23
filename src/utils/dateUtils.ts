const AZ_MONTHS = [
  "Yan", "Fev", "Mar", "Apr", "May", "İyn",
  "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"
];

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

export function diffDays(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split("-").map(Number);
  const [ty, tm, td] = toISO.split("-").map(Number);
  const from = new Date(fy, fm - 1, fd).getTime();
  const to = new Date(ty, tm - 1, td).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export function formatShortDateAz(isoDate?: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[0], 10);
  const currentYear = new Date().getFullYear();
  const monthLabel = AZ_MONTHS[monthIndex] ?? parts[1];
  return year !== currentYear ? `${day} ${monthLabel} ${year}` : `${day} ${monthLabel}`;
}

export function distributeDates(startISO: string, endISO: string, count: number): string[] {
  if (count <= 0) return [];
  const totalDays = Math.max(0, diffDays(startISO, endISO));
  if (count === 1) return [endISO];
  return Array.from({ length: count }, (_, idx) => {
    const ratio = (idx + 1) / count;
    const offset = Math.round(totalDays * ratio);
    return addDaysISO(startISO, offset);
  });
}

export function getDeadlineStatus(targetDate?: string, isCompleted?: boolean): {
  label: string;
  tone: "neutral" | "soon" | "overdue" | "done";
} | null {
  if (!targetDate) return null;
  if (isCompleted) {
    return { label: `Tamamlandı · ${formatShortDateAz(targetDate)}`, tone: "done" };
  }
  const today = getTodayISO();
  const daysLeft = diffDays(today, targetDate);

  if (daysLeft < 0) {
    return { label: `${Math.abs(daysLeft)} gün gecikib`, tone: "overdue" };
  }
  if (daysLeft === 0) {
    return { label: "Bu gün son gündür", tone: "soon" };
  }
  if (daysLeft <= 2) {
    return { label: `${daysLeft} gün qalıb`, tone: "soon" };
  }
  return { label: `${formatShortDateAz(targetDate)} · ${daysLeft} gün qalıb`, tone: "neutral" };
}
