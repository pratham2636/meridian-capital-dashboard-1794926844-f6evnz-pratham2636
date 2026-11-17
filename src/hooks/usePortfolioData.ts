
"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getPortfolio,
  getHoldings,
  getPerformance,
  getRiskMetrics,
  getMarketOverview,
  getNewsFeed,
  getAlerts,
} from "../data/mockApi";

export const portfolioQueryKeys = {
  all: ["portfolio"] as const,
  summary: () => [...portfolioQueryKeys.all, "summary"] as const,
  holdings: () => [...portfolioQueryKeys.all, "holdings"] as const,
  performance: () => [...portfolioQueryKeys.all, "performance"] as const,
  risk: () => [...portfolioQueryKeys.all, "risk"] as const,
  market: () => [...portfolioQueryKeys.all, "market"] as const,
  news: () => [...portfolioQueryKeys.all, "news"] as const,
  alerts: () => [...portfolioQueryKeys.all, "alerts"] as const,
};

const DEFAULT_STALE_TIME = 30_000;

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioQueryKeys.summary(),
    queryFn: () => getPortfolio(),
    staleTime: DEFAULT_STALE_TIME,
    refetchInterval: 30_000,
  });
}

export function useHoldings() {
  return useQuery({
    queryKey: portfolioQueryKeys.holdings(),
    queryFn: getHoldings,
    staleTime: DEFAULT_STALE_TIME,
    refetchInterval: 30_000,
  });
}

export function usePerformance() {
  return useQuery({
    queryKey: portfolioQueryKeys.performance(),
    queryFn: getPerformance,
    staleTime: DEFAULT_STALE_TIME,
    refetchInterval: 60_000,
  });
}

export function useRiskMetrics() {
  return useQuery({
    queryKey: portfolioQueryKeys.risk(),
    queryFn: getRiskMetrics,
    staleTime: DEFAULT_STALE_TIME,
    refetchInterval: 60_000,
  });
}

export function useMarketOverview() {
  return useQuery({
    queryKey: portfolioQueryKeys.market(),
    queryFn: getMarketOverview,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function useNewsFeed() {
  return useQuery({
    queryKey: portfolioQueryKeys.news(),
    queryFn: getNewsFeed,
    staleTime: DEFAULT_STALE_TIME,
    refetchInterval: 60_000,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: portfolioQueryKeys.alerts(),
    queryFn: getAlerts,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
