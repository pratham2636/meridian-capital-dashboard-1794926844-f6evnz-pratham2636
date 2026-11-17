
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  getPortfolio,
  getHoldings,
  getPerformance,
  getRiskMetrics,
  getMarketOverview,
  getNewsFeed,
  getAlerts,
  setMockLatency,
} from "./mockApi";

describe("Mock API Tests", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    setMockLatency(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setMockLatency(250);
  });

  it("should return portfolio details", async () => {
    const portfolio = await getPortfolio();

    expect(portfolio.id).toBe("MER-001");
    expect(portfolio.name).toBe("Private Wealth Portfolio");
    expect(portfolio.totalValue).toBe(45000000000);
    expect(portfolio.currency).toBe("USD");
    expect(portfolio.updatedAt).toBeTruthy();
  });

  it("should return portfolio details for a custom ID", async () => {
    const portfolio = await getPortfolio("MER-002");

    expect(portfolio.id).toBe("MER-002");
  });

  it("should return all holdings", async () => {
    const holdings = await getHoldings();

    expect(holdings).toHaveLength(4);
    expect(holdings[0].symbol).toBe("RELIANCE");
    expect(holdings[1].symbol).toBe("HDFCBANK");
    expect(holdings[2].assetClass).toBe("Fixed Income");
    expect(holdings[3].assetClass).toBe("Alternatives");
  });

  it("should return a copy of holdings data", async () => {
    const first = await getHoldings();
    const second = await getHoldings();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
  });

  it("should return performance data", async () => {
    const performance = await getPerformance();

    expect(performance).toHaveLength(11);
    expect(performance[0].date).toBe("Jan");
    expect(performance[0].portfolio).toBe(100);
    expect(performance[10].date).toBe("Nov");
  });

  it("should return risk metrics", async () => {
    const risk = await getRiskMetrics();

    expect(risk.var95).toBe(1250000);
    expect(risk.var99).toBe(2100000);
    expect(risk.sharpeRatio).toBe(1.82);
    expect(risk.riskLevel).toBe("Moderate");
  });

  it("should return market overview", async () => {
    const market = await getMarketOverview();

    expect(market).toHaveLength(4);
    expect(market[0].name).toBe("NIFTY 50");
    expect(market[1].name).toBe("S&P 500");
    expect(market[2].name).toBe("NASDAQ");
  });

  it("should return news feed", async () => {
    const news = await getNewsFeed();

    expect(news).toHaveLength(3);
    expect(news[0].title).toBe(
      "Global equity markets show positive momentum"
    );
    expect(news[0].impact).toBe("High");
    expect(news[0].publishedAt).toBeTruthy();
  });

  it("should return alerts", async () => {
    const alerts = await getAlerts();

    expect(alerts).toHaveLength(3);
    expect(alerts[0].severity).toBe("Warning");
    expect(alerts[1].severity).toBe("Info");
    expect(alerts[2].read).toBe(true);
  });
});
