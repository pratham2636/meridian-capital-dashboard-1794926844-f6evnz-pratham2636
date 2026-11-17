
export interface Allocation {
  name: string;
  value: number;
  color: string;
}

export const demoAllocations: Allocation[] = [
  { name: "Equities", value: 42, color: "#58D6C5" },
  { name: "Fixed Income", value: 28, color: "#7798E8" },
  { name: "Alternatives", value: 18, color: "#D5A96C" },
  { name: "Cash", value: 12, color: "#A4A9B8" },
];
export interface PerformanceData {
  date: string;
  portfolio: number;
  nifty50: number;
  sp500: number;
}

export const demoPerformance: PerformanceData[] = [
  { date: "Jan", portfolio: 100, nifty50: 100, sp500: 100 },
  { date: "Feb", portfolio: 103, nifty50: 101, sp500: 102 },
  { date: "Mar", portfolio: 101, nifty50: 99, sp500: 100 },
  { date: "Apr", portfolio: 106, nifty50: 103, sp500: 104 },
  { date: "May", portfolio: 109, nifty50: 105, sp500: 106 },
  { date: "Jun", portfolio: 107, nifty50: 104, sp500: 108 },
  { date: "Jul", portfolio: 113, nifty50: 108, sp500: 111 },
  { date: "Aug", portfolio: 116, nifty50: 110, sp500: 113 },
  { date: "Sep", portfolio: 114, nifty50: 109, sp500: 112 },
  { date: "Oct", portfolio: 120, nifty50: 113, sp500: 116 },
  { date: "Nov", portfolio: 124, nifty50: 115, sp500: 119 },
];