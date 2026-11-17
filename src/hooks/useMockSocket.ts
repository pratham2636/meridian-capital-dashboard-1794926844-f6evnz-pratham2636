
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  startMockSocket,
  stopMockSocket,
  subscribeToMockSocket,
} from "../data/wsSimulator";

import type {
  AlertItem,
  NewsItem,
  Holding,
  MarketIndex,
} from "../data/mockApi";

import { portfolioQueryKeys } from "./usePortfolioData";

export function useMockSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToMockSocket((event) => {
      switch (event.type) {
        case "MARKET_UPDATE":
          queryClient.setQueryData<MarketIndex[]>(
            portfolioQueryKeys.market(),
            event.data
          );
          break;

        case "NEW_ALERT":
          queryClient.setQueryData<AlertItem[]>(
            portfolioQueryKeys.alerts(),
            (old) => (old ? [event.data, ...old] : [event.data])
          );
          break;

        case "NEW_NEWS":
          queryClient.setQueryData<NewsItem[]>(
            portfolioQueryKeys.news(),
            (old) => (old ? [event.data, ...old] : [event.data])
          );
          break;

        case "PRICE_UPDATE":
          queryClient.setQueryData<Holding[]>(
            portfolioQueryKeys.holdings(),
            (old) =>
              old?.map((holding) =>
                holding.symbol === event.data.symbol
                  ? {
                      ...holding,
                      currentPrice: event.data.price,
                      marketValue: holding.quantity * event.data.price,
                    }
                  : holding
              )
          );
          break;
      }
    });

    startMockSocket();

    return () => {
      unsubscribe();
      stopMockSocket();
    };
  }, [queryClient]);
}
