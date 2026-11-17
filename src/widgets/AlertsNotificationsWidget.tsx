
"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Check,
  Trash2,
  CheckCheck,
  Clock,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { WidgetProps } from "../types/widget";
import { useAlerts } from "../hooks/usePortfolioData";
import type { AlertItem } from "../data/mockApi";

type FilterType = "All" | "Unread" | "Read";

const severityOrder: AlertItem["severity"][] = [
  "Critical",
  "Warning",
  "Info",
];

export default function AlertsNotificationsWidget({
  settings,
}: WidgetProps) {
  const { data: apiAlerts = [], isLoading, isError } = useAlerts();

  const [filter, setFilter] = useState<FilterType>("All");
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [snoozedIds, setSnoozedIds] = useState<string[]>([]);
  const [readOverrides, setReadOverrides] = useState<string[]>([]);

  const alerts = useMemo(() => {
    return apiAlerts
      .filter(
        (alert) =>
          !dismissedIds.includes(alert.id) &&
          !snoozedIds.includes(alert.id)
      )
      .map((alert) => ({
        ...alert,
        read: alert.read || readOverrides.includes(alert.id),
      }));
  }, [apiAlerts, dismissedIds, snoozedIds, readOverrides]);

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "Unread") return !alert.read;
    if (filter === "Read") return alert.read;
    return true;
  });

  const groupedAlerts = severityOrder
    .map((severity) => ({
      severity,
      items: filteredAlerts.filter(
        (alert) => alert.severity === severity
      ),
    }))
    .filter((group) => group.items.length > 0);

  const markAsRead = (id: string) => {
    setReadOverrides((previous) =>
      previous.includes(id) ? previous : [...previous, id]
    );
  };

 
const markAllAsRead = () => {
  setReadOverrides((previous) =>
    Array.from(
      new Set([
        ...previous,
        ...alerts
          .filter((alert) => !alert.read)
          .map((alert) => alert.id),
      ])
    )
  );
};

  const dismissAlert = (id: string) => {
    setDismissedIds((previous) => [...previous, id]);
  };

  const snoozeAlert = (id: string) => {
    setSnoozedIds((previous) => [...previous, id]);
  };

  const getIcon = (severity: AlertItem["severity"]) => {
    if (severity === "Critical") {
      return <AlertTriangle size={18} />;
    }

    if (severity === "Warning") {
      return <Info size={18} />;
    }

    return <CheckCircle2 size={18} />;
  };

  const formatTime = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <section className="alerts-widget">
      <div className="alerts-summary">
        <div className="alerts-summary-icon">
          <Bell size={22} />
        </div>

        <div>
          <strong>{unreadCount} unread alerts</strong>
          <span>Portfolio monitoring notifications</span>
        </div>

        <span className="alerts-total">{alerts.length} Total</span>
      </div>

      <div className="alerts-toolbar">
        <div className="alerts-filters">
          {(["All", "Unread", "Read"] as FilterType[]).map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="alerts-mark-all"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={15} />
          Mark all read
        </button>
      </div>

      <div className="alerts-list">
        {isLoading ? (
          <div className="alerts-empty">
            <Bell size={28} />
            <strong>Loading alerts...</strong>
            <span>Fetching portfolio notifications.</span>
          </div>
        ) : isError ? (
          <div className="alerts-empty">
            <AlertTriangle size={28} />
            <strong>Unable to load alerts</strong>
            <span>Please try again later.</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="alerts-empty">
            <CheckCircle2 size={28} />
            <strong>All clear</strong>
            <span>No notifications in this filter.</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {groupedAlerts.map((group) => (
              <div className="alert-severity-group" key={group.severity}>
                <div className="alert-group-heading">
                  <span
                    className={`alert-severity ${group.severity.toLowerCase()}`}
                  >
                    {group.severity}
                  </span>
                  <span>{group.items.length} alerts</span>
                </div>

                {group.items.map((alert) => (
                  <motion.article
                    layout
                    key={alert.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.2 }}
                    className={`alert-card ${
                      alert.read ? "read" : "unread"
                    } ${alert.severity.toLowerCase()}`}
                  >
                    <div className="alert-icon">
                      {alert.severity === "Critical" ? (
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                          }}
                        >
                          {getIcon(alert.severity)}
                        </motion.span>
                      ) : (
                        getIcon(alert.severity)
                      )}
                    </div>

                    <div className="alert-content">
                      <div className="alert-title-row">
                        <strong>{alert.title}</strong>

                        <span
                          className={`alert-severity ${alert.severity.toLowerCase()}`}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      <p>{alert.message}</p>

                      <div className="alert-footer">
                        <span>{formatTime(alert.createdAt)}</span>

                        <div className="alert-actions">
                          {!alert.read && (
                            <button
                              type="button"
                              onClick={() => markAsRead(alert.id)}
                              title="Mark as read"
                            >
                              <Check size={15} />
                              Read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => snoozeAlert(alert.id)}
                            title="Snooze alert"
                          >
                            <Clock size={15} />
                            Snooze
                          </button>

                          <button
                            type="button"
                            onClick={() => dismissAlert(alert.id)}
                            title="Dismiss alert"
                          >
                            <Trash2 size={15} />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="alerts-disclaimer">
        <span className="alerts-live-dot" />
        Illustrative notifications · Demo data, not live alerts
      </div>
    </section>
  );
}
