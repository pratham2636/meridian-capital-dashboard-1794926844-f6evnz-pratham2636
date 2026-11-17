
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { WidgetProps } from "../types/widget";
import { useNewsFeed } from "../hooks/usePortfolioData";

type Category = "All" | "Markets" | "Economy" | "Technology";

export default function NewsResearchFeedWidget(_props: WidgetProps) {
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: newsItems = [],
    isLoading,
    isError,
    isFetching,
  } = useNewsFeed();

  const categories: Category[] = [
    "All",
    "Markets",
    "Economy",
    "Technology",
  ];

  const sources = useMemo(
    () => ["All", ...Array.from(new Set(newsItems.map((item) => item.source)))],
    [newsItems]
  );

  const filteredNews = useMemo(() => {
    return newsItems.filter((item) => {
      const matchesCategory =
        category === "All" || item.category === category;

      const matchesSource =
        selectedSource === "All" || item.source === selectedSource;

      const matchesSearch =
        `${item.title} ${item.summary} ${item.source} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesCategory && matchesSource && matchesSearch;
    });
  }, [newsItems, category, selectedSource, search]);

  const formatPublishedDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <section className="news-feed-widget">
        <p className="news-feed-empty">Loading news and research...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="news-feed-widget">
        <p className="news-feed-empty">
          Unable to load news. Please try again.
        </p>
      </section>
    );
  }

  return (
    <section className="news-feed-widget">
      <div className="news-feed-toolbar">
        <input
          type="search"
          placeholder="Search news and research..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search news"
        />

        <select
          value={selectedSource}
          onChange={(event) => setSelectedSource(event.target.value)}
          aria-label="Filter by news source"
        >
          {sources.map((source) => (
            <option key={source} value={source}>
              {source === "All" ? "All Sources" : source}
            </option>
          ))}
        </select>
      </div>

      <div className="news-category-filters">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="news-feed-list">
        <AnimatePresence mode="popLayout">
          {filteredNews.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <motion.article
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="news-feed-item"
                key={item.id}
              >
                <div className="news-feed-item-top">
                  <span className="news-category-label">
                    {item.category}
                  </span>

                  <span
                    className={`news-impact ${item.impact.toLowerCase()}`}
                  >
                    {item.impact} impact
                  </span>
                </div>

                <button
                  type="button"
                  className="news-feed-expand"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : item.id)
                  }
                  aria-expanded={isExpanded}
                >
                  <h4>{item.title}</h4>
                  <span>{isExpanded ? "−" : "+"}</span>
                </button>

                <p>{item.summary}</p>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="news-feed-expanded">
                        <strong>Research Details</strong>
                        <p>{item.summary}</p>

                        <span>
                          Category: {item.category}
                        </span>

                        <span>
                          Impact level: {item.impact}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="news-feed-meta">
                  <span>{item.source}</span>
                  <span>{formatPublishedDate(item.publishedAt)}</span>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {filteredNews.length === 0 && (
          <div className="news-feed-empty">
            No matching news found.
          </div>
        )}
      </div>

      <div className="news-feed-footer">
        Showing {filteredNews.length} of {newsItems.length} research items

        <span>
          {isFetching ? "Updating..." : "Mock research data"}
        </span>
      </div>
    </section>
  );
}
