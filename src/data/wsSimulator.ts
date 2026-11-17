
import type { AlertItem, MarketIndex, NewsItem } from "./mockApi";

export type MarketUpdate = {
  type: "MARKET_UPDATE";
  data: MarketIndex[];
  timestamp: string;
};

export type AlertUpdate = {
  type: "NEW_ALERT";
  data: AlertItem;
  timestamp: string;
};

export type NewsUpdate = {
  type: "NEW_NEWS";
  data: NewsItem;
  timestamp: string;
};

export type PriceUpdate = {
  type: "PRICE_UPDATE";
  data: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  };
  timestamp: string;
};

export type MockSocketEvent =
  | MarketUpdate
  | AlertUpdate
  | NewsUpdate
  | PriceUpdate;

type SimulatorConfig = {
  marketInterval: number;
  priceInterval: number;
  alertInterval: number;
  newsInterval: number;
};

const defaultConfig: SimulatorConfig = {
  marketInterval: 5000,
  priceInterval: 2000,
  alertInterval: 15000,
  newsInterval: 30000,
};

const symbols = [
  { symbol: "RELIANCE", price: 1250 },
  { symbol: "HDFCBANK", price: 1520 },
  { symbol: "INFY", price: 1840 },
  { symbol: "TCS", price: 3920 },
];

const marketIndices: MarketIndex[] = [
  { name: "NIFTY 50", value: 24150, change: 125, changePercent: 0.52 },
  { name: "S&P 500", value: 5980, change: 32, changePercent: 0.55 },
  { name: "NASDAQ", value: 19240, change: 85, changePercent: 0.44 },
  { name: "DOW JONES", value: 43850, change: 135, changePercent: 0.31 },
];

const alertMessages = [
  {
    title: "Market volatility update",
    message: "Market volatility has changed.",
    severity: "Info" as const,
    category: "Market",
  },
  {
    title: "Portfolio concentration alert",
    message: "Portfolio exposure is approaching its configured threshold.",
    severity: "Warning" as const,
    category: "Portfolio",
  },
  {
    title: "Risk monitoring update",
    message: "Portfolio risk metrics have been refreshed.",
    severity: "Info" as const,
    category: "Risk",
  },
];

const newsItems = [
  {
    title: "Global markets show changing investor sentiment",
    category: "Markets",
    summary: "Major indices are showing fresh market movements.",
  },
  {
    title: "Technology sector remains in focus",
    category: "Technology",
    summary: "Institutional investors continue monitoring technology stocks.",
  },
  {
    title: "Economic outlook attracts market attention",
    category: "Economy",
    summary: "Investors are assessing economic and policy developments.",
  },
];

let timers: ReturnType<typeof setInterval>[] = [];
let isRunning = false;

const listeners = new Set<(event: MockSocketEvent) => void>();

function emit(event: MockSocketEvent) {
  listeners.forEach((listener) => listener(event));
}

function randomChange(max = 1) {
  return (Math.random() - 0.5) * 2 * max;
}

export function subscribeToMockSocket(
  listener: (event: MockSocketEvent) => void
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function startMockSocket(
  config: Partial<SimulatorConfig> = {}
) {
  if (isRunning) return;

  isRunning = true;

  const settings = { ...defaultConfig, ...config };

  // Market ticker updates
  timers.push(
    setInterval(() => {
      marketIndices.forEach((index) => {
        const movement = randomChange(0.15);
        index.value = Number((index.value * (1 + movement / 100)).toFixed(2));
        index.changePercent = Number(
          (index.changePercent + movement).toFixed(2)
        );
      });

      emit({
        type: "MARKET_UPDATE",
        data: marketIndices.map((item) => ({ ...item })),
        timestamp: new Date().toISOString(),
      });
    }, settings.marketInterval)
  );

  // Individual stock price updates
  timers.push(
    setInterval(() => {
      const stock = symbols[Math.floor(Math.random() * symbols.length)];
      const changePercent = randomChange(0.5);

      stock.price = Number(
        (stock.price * (1 + changePercent / 100)).toFixed(2)
      );

      emit({
        type: "PRICE_UPDATE",
        data: {
          symbol: stock.symbol,
          price: stock.price,
          change: Number((stock.price * changePercent / 100).toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
        },
        timestamp: new Date().toISOString(),
      });
    }, settings.priceInterval)
  );

  // Simulated alerts
  timers.push(
    setInterval(() => {
      const alert =
        alertMessages[Math.floor(Math.random() * alertMessages.length)];

      emit({
        type: "NEW_ALERT",
        data: {
          id: `A-${Date.now()}`,
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          category: alert.category,
          createdAt: new Date().toISOString(),
          read: false,
        },
        timestamp: new Date().toISOString(),
      });
    }, settings.alertInterval)
  );

  // Simulated news updates
  timers.push(
    setInterval(() => {
      const news =
        newsItems[Math.floor(Math.random() * newsItems.length)];

      emit({
        type: "NEW_NEWS",
        data: {
          id: `N-${Date.now()}`,
          title: news.title,
          category: news.category,
          source: "Meridian Market Intelligence",
          summary: news.summary,
          publishedAt: new Date().toISOString(),
          impact: "Medium",
        },
        timestamp: new Date().toISOString(),
      });
    }, settings.newsInterval)
  );
}

export function stopMockSocket() {
  timers.forEach((timer) => clearInterval(timer));
  timers = [];
  isRunning = false;
}

export function isMockSocketRunning() {
  return isRunning;
}
