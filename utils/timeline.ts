// utils/timeline.ts
export function generateDates(resolution: "daily" | "monthly" | "yearly") {
  const start = new Date(2000, 0, 1);
  const end = new Date();
  const step =
    resolution === "daily" ? 1 : resolution === "monthly" ? 30 : 365;
  const result: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    result.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + step);
  }
  return result;
}

export function formatDate(date: string, resolution: string) {
  const d = new Date(date);
  if (resolution === "yearly") return `${d.getFullYear()}`;
  if (resolution === "monthly")
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
