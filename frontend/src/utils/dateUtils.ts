export function formatInTimezone(
  dateInput: string | Date | number,
  timeZone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);

    const tz = timeZone || getBrowserTimezone();
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    };

    return new Intl.DateTimeFormat("pl-PL", {
      ...defaultOptions,
      timeZone: tz,
    }).format(date);
  } catch (e) {
    return String(dateInput);
  }
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Warsaw";
  } catch (e) {
    return "Europe/Warsaw";
  }
}
