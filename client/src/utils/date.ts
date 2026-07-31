const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function toDate(value: string | Date): Date {
  return value instanceof Date
    ? value
    : new Date(value);
}

export function formatRelativeTime(
  value: string | Date
): string {
  const date = toDate(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < MINUTE) {
    return "Just now";
  }

  if (diff < HOUR) {
    const minutes = Math.floor(
      diff / MINUTE
    );

    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  if (diff < DAY) {
    const hours = Math.floor(
      diff / HOUR
    );

    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  if (diff < DAY * 2) {
    return "Yesterday";
  }

  if (diff < WEEK) {
    const days = Math.floor(
      diff / DAY
    );

    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

export function formatFullDate(
  value: string | Date
): string {
  const date = toDate(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}