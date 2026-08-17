export function formatSalary(min?: number, max?: number): string {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  if (min == null && max == null) return "Thoả thuận";
  if (min != null && max != null) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min != null) return `Từ ${formatter.format(min)}`;
  return `Tới ${formatter.format(max as number)}`;
}

export function formatRelativeDate(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
  const date = new Date(iso);
  const now = new Date();
  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "seconds" },
    { amount: 60, unit: "minutes" },
    { amount: 24, unit: "hours" },
    { amount: 7, unit: "days" },
    { amount: 4.34524, unit: "weeks" },
    { amount: 12, unit: "months" },
    { amount: Number.POSITIVE_INFINITY, unit: "years" },
  ];

  let duration = diffInSeconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return rtf.format(Math.round(duration), "years");
}
