
"use client";

import { useMemo, useState } from "react";
import { TableVirtuoso } from "react-virtuoso";

import type { WidgetProps } from "../types/widget";
import { useHoldings } from "../hooks/usePortfolioData";

type SortBy =
  | "name"
  | "quantity"
  | "marketValue"
  | "weight"
  | "gainLossPercent";

type HoldingRow = {
  id: string;
  name: string;
  symbol: string;
  assetClass: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
};

type ColumnKey =
  | "asset"
  | "assetClass"
  | "quantity"
  | "buyPrice"
  | "currentPrice"
  | "marketValue"
  | "weight"
  | "return";

const INITIAL_COLUMNS: Record<ColumnKey, boolean> = {
  asset: true,
  assetClass: true,
  quantity: true,
  buyPrice: false,
  currentPrice: true,
  marketValue: true,
  weight: true,
  return: true,
};

const COLUMN_LABELS: Record<ColumnKey, string> = {
  asset: "Asset",
  assetClass: "Asset Class",
  quantity: "Quantity",
  buyPrice: "Buy Price",
  currentPrice: "Current Price",
  marketValue: "Market Value",
  weight: "Portfolio Weight",
  return: "Return",
};

export default function HoldingsDataTableWidget(_props: WidgetProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("marketValue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [visibleColumns, setVisibleColumns] =
    useState<Record<ColumnKey, boolean>>(INITIAL_COLUMNS);

  const {
    data: holdings = [],
    isLoading,
    isError,
    isFetching,
  } = useHoldings();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const totalMarketValue = useMemo(
    () => holdings.reduce((total, item) => total + item.marketValue, 0),
    [holdings]
  );

  const filteredHoldings = useMemo<HoldingRow[]>(() => {
    const rows = holdings
      .map((item) => {
        const gainLoss =
          item.quantity * (item.currentPrice - item.buyPrice);

        const weight =
          totalMarketValue > 0
            ? (item.marketValue / totalMarketValue) * 100
            : 0;

        const gainLossPercent =
          item.buyPrice > 0
            ? ((item.currentPrice - item.buyPrice) / item.buyPrice) * 100
            : 0;

        return {
          ...item,
          gainLoss,
          gainLossPercent,
          weight,
        };
      })
      .filter((item) =>
        `${item.name} ${item.symbol} ${item.assetClass}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );

    return rows.sort((a, b) => {
      const first = a[sortBy];
      const second = b[sortBy];

      const comparison =
        typeof first === "string" && typeof second === "string"
          ? first.localeCompare(second)
          : Number(first) - Number(second);

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [holdings, search, sortBy, sortDirection, totalMarketValue]);

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const toggleColumn = (column: ColumnKey) => {
    setVisibleColumns((previous) => ({
      ...previous,
      [column]: !previous[column],
    }));
  };

  const exportCSV = () => {
    const columns = (
      Object.keys(COLUMN_LABELS) as ColumnKey[]
    ).filter((column) => visibleColumns[column]);

    const getValue = (item: HoldingRow, column: ColumnKey) => {
      switch (column) {
        case "asset":
          return item.name;
        case "assetClass":
          return item.assetClass;
        case "quantity":
          return item.quantity;
        case "buyPrice":
          return item.buyPrice;
        case "currentPrice":
          return item.currentPrice;
        case "marketValue":
          return item.marketValue;
        case "weight":
          return `${item.weight.toFixed(2)}%`;
        case "return":
          return `${item.gainLossPercent.toFixed(2)}%`;
      }
    };

    const escapeCSV = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csvRows = [
      columns.map((column) => escapeCSV(COLUMN_LABELS[column])).join(","),
      ...filteredHoldings.map((item) =>
        columns
          .map((column) => escapeCSV(getValue(item, column)))
          .join(",")
      ),
    ];

    const blob = new Blob(
      ["\uFEFF" + csvRows.join("\n")],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "meridian-holdings.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const sortIndicator = (column: SortBy) =>
    sortBy === column
      ? sortDirection === "asc" ? " ↑" : " ↓"
      : " ↕";

  if (isLoading) {
    return (
      <section className="holdings-widget">
        <p className="holdings-empty">Loading holdings...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="holdings-widget">
        <p className="holdings-empty">
          Unable to load holdings. Please try again.
        </p>
      </section>
    );
  }

  return (
    <section className="holdings-widget">
      <div className="holdings-toolbar">
        <input
          type="search"
          placeholder="Search holdings..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search holdings"
        />

        <div className="holdings-table-actions">
          <details className="holdings-column-menu">
            <summary>Columns ▾</summary>

            <div className="holdings-column-dropdown">
              {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map(
                (column) => (
                  <label key={column}>
                    <input
                      type="checkbox"
                      checked={visibleColumns[column]}
                      onChange={() => toggleColumn(column)}
                    />
                    {COLUMN_LABELS[column]}
                  </label>
                )
              )}
            </div>
          </details>

          <button type="button" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="holdings-table-wrapper">
        <TableVirtuoso
          style={{ height: 320, width: "100%" }}
          data={filteredHoldings}
          components={{
            Table: (props) => (
              <table
                {...props}
                className="holdings-table"
              />
            ),
          }}
          fixedHeaderContent={() => (
            <tr>
              {visibleColumns.asset && (
                <th>
                  <button type="button" onClick={() => toggleSort("name")}>
                    Asset{sortIndicator("name")}
                  </button>
                </th>
              )}

              {visibleColumns.assetClass && <th>Asset Class</th>}

              {visibleColumns.quantity && (
                <th>
                  <button type="button" onClick={() => toggleSort("quantity")}>
                    Quantity{sortIndicator("quantity")}
                  </button>
                </th>
              )}

              {visibleColumns.buyPrice && <th>Buy Price</th>}

              {visibleColumns.currentPrice && <th>Current Price</th>}

              {visibleColumns.marketValue && (
                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("marketValue")}
                  >
                    Market Value{sortIndicator("marketValue")}
                  </button>
                </th>
              )}

              {visibleColumns.weight && (
                <th>
                  <button type="button" onClick={() => toggleSort("weight")}>
                    Weight{sortIndicator("weight")}
                  </button>
                </th>
              )}

              {visibleColumns.return && (
                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("gainLossPercent")}
                  >
                    Return{sortIndicator("gainLossPercent")}
                  </button>
                </th>
              )}
            </tr>
          )}
          itemContent={(_index, item) => (
            <>
              {visibleColumns.asset && (
                <td>
                  <strong>{item.name}</strong>
                  <small>{item.symbol}</small>
                </td>
              )}

              {visibleColumns.assetClass && (
                <td>{item.assetClass}</td>
              )}

              {visibleColumns.quantity && (
                <td>{item.quantity.toLocaleString("en-IN")}</td>
              )}

              {visibleColumns.buyPrice && (
                <td>{formatCurrency(item.buyPrice)}</td>
              )}

              {visibleColumns.currentPrice && (
                <td>{formatCurrency(item.currentPrice)}</td>
              )}

              {visibleColumns.marketValue && (
                <td>{formatCurrency(item.marketValue)}</td>
              )}

              {visibleColumns.weight && (
                <td>{item.weight.toFixed(1)}%</td>
              )}

              {visibleColumns.return && (
                <td
                  className={
                    item.gainLossPercent >= 0
                      ? "holding-positive"
                      : "holding-negative"
                  }
                >
                  {item.gainLossPercent > 0 ? "+" : ""}
                  {item.gainLossPercent.toFixed(2)}%
                </td>
              )}
            </>
          )}
        />

        {filteredHoldings.length === 0 && (
          <p className="holdings-empty">No holdings found.</p>
        )}
      </div>

      <div className="holdings-footer">
        Showing {filteredHoldings.length} of {holdings.length} holdings

        <span>
          {isFetching ? "Updating..." : "Live mock data"}
        </span>
      </div>
    </section>
  );
}
