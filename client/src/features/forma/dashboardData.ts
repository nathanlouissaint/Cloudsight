export const dashboardPeriods = {
  "7 days": { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], executions: [72, 83, 74, 89, 80, 103, 91], previousExecutions: 520, hours: 74, previousHours: 65 },
  "30 days": { labels: ["1–4", "5–8", "9–12", "13–16", "17–20", "21–25", "26–30"], executions: [250, 300, 310, 340, 350, 400, 418], previousExecutions: 2120, hours: 296, previousHours: 265 },
  "90 days": { labels: ["1–13", "14–26", "27–39", "40–52", "53–65", "66–78", "79–90"], executions: [800, 900, 950, 1000, 1050, 1100, 1304], previousExecutions: 6500, hours: 888, previousHours: 810 },
} as const;
export function comparison(current: number, previous: number) { return `${current >= previous ? "+" : ""}${((current - previous) / previous * 100).toFixed(1)}% vs previous period`; }
