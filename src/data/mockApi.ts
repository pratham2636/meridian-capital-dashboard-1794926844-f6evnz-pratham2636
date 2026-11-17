
export type AssetClass =
  | "Equities"
  | "Fixed Income"
  | "Alternatives"
  | "Cash";

export interface PortfolioData {
  id: string;
  name: string;
  totalValue: number;
  investedValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  ytdReturn: number;
  cashAvailable: number;
  currency: string;
  updatedAt: string;
}

export interface Holding {
  id: string;
  name: string;
  symbol: string;
  assetClass: AssetClass;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface PerformancePoint {
  date: string;
  portfolio: number;
  benchmark: number;
}

export interface RiskMetrics {
  var95: number;
  var99: number;
  sharpeRatio: number;
  volatility: number;
  beta: number;
  maxDrawdown: number;
  riskLevel: "Low" | "Moderate" | "High";
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  source: string;
  summary: string;
  publishedAt: string;
  impact: "High" | "Medium" | "Low";
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: "Critical" | "Warning" | "Info";
  category: string;
  createdAt: string;
  read: boolean;
}

let simulatedLatency = 250;

export function setMockLatency(milliseconds: number) {
  simulatedLatency = Math.max(0, milliseconds);
}

function wait() {
  const extraLatency = Math.random() * 150;

  return new Promise<void>((resolve) => {
    setTimeout(resolve, simulatedLatency + extraLatency);
  });
}

function timestamp() {
  return new Date().toISOString();
}

// 1. PORTFOLIO API

export async function getPortfolio(
  id = "MER-001"
): Promise<PortfolioData> {
  await wait();

  return {
    id,
    name: "Private Wealth Portfolio",
    totalValue: 45000000000,
    investedValue: 39600000000,
    dailyChange: 284500,
    dailyChangePercent: 2.34,
    ytdReturn: 12.85,
    cashAvailable: 5400000000,
    currency: "USD",
    updatedAt: timestamp(),
  };
}

// 2. HOLDINGS API

const holdings: Holding[] = [
  {
    id: "H001",
    name: "Reliance Industries",
    symbol: "RELIANCE",
    assetClass: "Equities",
    quantity: 500,
    buyPrice: 1200,
    currentPrice: 1250,
    marketValue: 625000,
    gainLoss: 25000,
    gainLossPercent: 4.17,
  },
  {
    id: "H002",
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    assetClass: "Equities",
    quantity: 300,
    buyPrice: 1450,
    currentPrice: 1520,
    marketValue: 456000,
    gainLoss: 21000,
    gainLossPercent: 4.83,
  },
  {
    id: "H003",
    name: "Government Securities",
    symbol: "GSEC",
    assetClass: "Fixed Income",
    quantity: 1000,
    buyPrice: 980,
    currentPrice: 995,
    marketValue: 995000,
    gainLoss: 15000,
    gainLossPercent: 1.53,
  },
  {
    id: "H004",
    name: "Gold ETF",
    symbol: "GOLDBEES",
    assetClass: "Alternatives",
    quantity: 200,
    buyPrice: 55,
    currentPrice: 59,
    marketValue: 11800,
    gainLoss: 800,
    gainLossPercent: 7.27,
  },
];

export async function getHoldings(): Promise<Holding[]> {
  await wait();
  return holdings.map((holding) => ({ ...holding }));
}

// 3. PERFORMANCE API

export async function getPerformance(): Promise<PerformancePoint[]> {
  await wait();

  return [
    { date: "Jan", portfolio: 100, benchmark: 100 },
    { date: "Feb", portfolio: 103, benchmark: 101 },
    { date: "Mar", portfolio: 101, benchmark: 99 },
    { date: "Apr", portfolio: 106, benchmark: 103 },
    { date: "May", portfolio: 109, benchmark: 105 },
    { date: "Jun", portfolio: 107, benchmark: 104 },
    { date: "Jul", portfolio: 113, benchmark: 108 },
    { date: "Aug", portfolio: 116, benchmark: 110 },
    { date: "Sep", portfolio: 114, benchmark: 109 },
    { date: "Oct", portfolio: 120, benchmark: 113 },
    { date: "Nov", portfolio: 124, benchmark: 115 },
  ];
}

// 4. RISK API

export async function getRiskMetrics(): Promise<RiskMetrics> {
  await wait();

  return {
    var95: 1250000,
    var99: 2100000,
    sharpeRatio: 1.82,
    volatility: 14.6,
    beta: 0.94,
    maxDrawdown: -6.4,
    riskLevel: "Moderate",
  };
}

// 5. MARKET OVERVIEW API

export async function getMarketOverview(): Promise<MarketIndex[]> {
  await wait();

  return [
    {
      name: "NIFTY 50",
      value: 24150.75,
      change: 125.4,
      changePercent: 0.52,
    },
    {
      name: "S&P 500",
      value: 5980.25,
      change: 32.8,
      changePercent: 0.55,
    },
    {
      name: "NASDAQ",
      value: 19240.6,
      change: 85.2,
      changePercent: 0.44,
    },
    {
      name: "DOW JONES",
      value: 43850.6,
      change: 135.2,
      changePercent: 0.31,
    },
  ];
}

// 6. NEWS API

export async function getNewsFeed(): Promise<NewsItem[]> {
  await wait();

  return [
    {
      id: "N001",
      title: "Global equity markets show positive momentum",
      category: "Markets",
      source: "Meridian Research",
      summary: "Major equity indices recorded gains amid improving investor sentiment.",
      publishedAt: timestamp(),
      impact: "High",
    },
    {
      id: "N002",
      title: "Central banks maintain cautious policy outlook",
      category: "Economy",
      source: "Market Intelligence",
      summary: "Investors continue monitoring inflation and interest rate expectations.",
      publishedAt: timestamp(),
      impact: "Medium",
    },
    {
      id: "N003",
      title: "Technology sector attracts institutional investment",
      category: "Technology",
      source: "Sector Research",
      summary: "Technology companies remain a key focus for institutional portfolios.",
      publishedAt: timestamp(),
      impact: "High",
    },
  ];
}

// 7. ALERTS API

export async function getAlerts(): Promise<AlertItem[]> {
  await wait();

  return [
    {
      id: "A001",
      title: "Portfolio concentration alert",
      message: "Technology exposure is approaching the configured threshold.",
      severity: "Warning",
      category: "Portfolio",
      createdAt: timestamp(),
      read: false,
    },
    {
      id: "A002",
      title: "Market volatility update",
      message: "Market volatility has increased compared with the previous session.",
      severity: "Info",
      category: "Market",
      createdAt: timestamp(),
      read: false,
    },
    {
      id: "A003",
      title: "Risk threshold notification",
      message: "Portfolio VaR remains within the configured risk limits.",
      severity: "Info",
      category: "Risk",
      createdAt: timestamp(),
      read: true,
    },
  ];
}
