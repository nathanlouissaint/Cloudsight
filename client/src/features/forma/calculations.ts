export function calculateSavings(employees: number, hours: number, rate: number, percent: number) {
  const weekly = employees * hours * percent / 100;
  const annual = weekly * 52;
  return { weekly, monthly: annual / 12, annual, annualCost: annual * rate };
}
export function funnelRate(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator * 100 : 0;
}
