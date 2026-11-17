
"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Props {
  widgetIds: string[];
  children: ReactNode;
}

const STORAGE_KEY = "meridian-widget-layouts";
const SCHEMA_VERSION = "1.0.0";

const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

const COLUMNS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

interface SavedLayoutDocument {
  version: string;
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  gridConfig: {
    columns: typeof COLUMNS;
    rowHeight: number;
    gap: number;
    compaction: "vertical" | "none";
    preventCollision: boolean;
  };
  widgets: Array<{
    id: string;
    position: Record<string, Layout | undefined>;
    config: Record<string, unknown>;
    dataSourceOverrides: Record<string, unknown>;
  }>;
  theme: string;
  breakpoints: typeof BREAKPOINTS;
  layouts: Layouts;
}

interface LayoutStorage {
  activeLayoutId: string;
  savedLayouts: SavedLayoutDocument[];
  history: SavedLayoutDocument[];
}

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createLayout(ids: string[], columns: number): Layout[] {
  const halfColumns = Math.max(1, columns / 2);

  return ids.map((id, index) => ({
    i: id,
    x: (index % halfColumns) * halfColumns,
    y: Math.floor(index / halfColumns) * 16,
    w: halfColumns,
    h: 16,
    minW: 2,
    minH: 8,
  }));
}

function createDefaultLayouts(ids: string[]): Layouts {
  return {
    lg: createLayout(ids, 12),
    md: createLayout(ids, 10),
    sm: createLayout(ids, 6),
    xs: createLayout(ids, 4),
    xxs: createLayout(ids, 2),
  };
}

function createDocument(
  name: string,
  description: string,
  layouts: Layouts,
  widgetIds: string[]
): SavedLayoutDocument {
  const now = new Date().toISOString();

  return {
    version: SCHEMA_VERSION,
    id: createId(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
    createdBy: "Local User",
    gridConfig: {
      columns: COLUMNS,
      rowHeight: 30,
      gap: 16,
      compaction: "vertical",
      preventCollision: false,
    },
    widgets: widgetIds.map((id) => {
      const position: Record<string, Layout | undefined> = {};

      Object.entries(layouts).forEach(([breakpoint, items]) => {
        position[breakpoint] = items?.find((item) => item.i === id);
      });

      return {
        id,
        position,
        config: {},
        dataSourceOverrides: {},
      };
    }),
    theme: "dark",
    breakpoints: BREAKPOINTS,
    layouts,
  };
}

function isLayoutStorage(value: unknown): value is LayoutStorage {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<LayoutStorage>;

  return (
    Array.isArray(data.savedLayouts) &&
    Array.isArray(data.history) &&
    typeof data.activeLayoutId === "string"
  );
}

function migrateLegacyLayouts(
  value: unknown,
  widgetIds: string[]
): Layouts | null {
  if (!value || typeof value !== "object") return null;

  const oldLayouts = value as Layouts;

  if (!oldLayouts.lg || !Array.isArray(oldLayouts.lg)) {
    return null;
  }

  const result: Layouts = {};

  Object.entries(COLUMNS).forEach(([breakpoint]) => {
    const existing = oldLayouts[breakpoint];

    if (Array.isArray(existing)) {
      result[breakpoint] = existing.filter((item) =>
        widgetIds.includes(item.i)
      );
    }
  });

  return {
    ...createDefaultLayouts(widgetIds),
    ...result,
  };
}

export default function AnalyticsWidgetGrid({
  widgetIds,
  children,
}: Props) {
  const [layouts, setLayouts] = useState<Layouts>(() =>
    createDefaultLayouts(widgetIds)
  );

  const [loaded, setLoaded] = useState(false);
  const [storage, setStorage] = useState<LayoutStorage>({
    activeLayoutId: "",
    savedLayouts: [],
    history: [],
  });

  const [selectedLayoutId, setSelectedLayoutId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLayout = storage.savedLayouts.find(
    (item) => item.id === storage.activeLayoutId
  );

  const writeStorage = useCallback((next: LayoutStorage) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorage(next);
    } catch (error) {
      console.error("Unable to save layout storage:", error);
    }
  }, []);

  // Load saved layouts and migrate the previous layout format.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (isLayoutStorage(parsed)) {
          const active = parsed.savedLayouts.find(
            (item) => item.id === parsed.activeLayoutId
          );

          setStorage(parsed);
          setSelectedLayoutId(parsed.activeLayoutId);

          if (active?.layouts) {
            setLayouts(active.layouts);
          }
        } else {
          const migrated = migrateLegacyLayouts(parsed, widgetIds);

          if (migrated) {
            const document = createDocument(
              "My Dashboard",
              "Migrated from the previous saved layout",
              migrated,
              widgetIds
            );

            const nextStorage: LayoutStorage = {
              activeLayoutId: document.id,
              savedLayouts: [document],
              history: [],
            };

            setStorage(nextStorage);
            setSelectedLayoutId(document.id);
            setLayouts(migrated);
            window.localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(nextStorage)
            );
          }
        }
      }
    } catch (error) {
      console.error("Unable to load widget layouts:", error);
    } finally {
      setLoaded(true);
    }
  }, [widgetIds]);

  // Keep widget positions in the active saved document.
  const persistCurrentLayout = useCallback(() => {
    if (!loaded) return;

    setStorage((previous) => {
      if (!previous.activeLayoutId) return previous;

      const updatedLayouts = previous.savedLayouts.map((document) => {
        if (document.id !== previous.activeLayoutId) return document;

        return {
          ...document,
          updatedAt: new Date().toISOString(),
          layouts,
          widgets: document.widgets.map((widget) => {
            const position: Record<string, Layout | undefined> = {};

            Object.entries(layouts).forEach(([breakpoint, items]) => {
              position[breakpoint] = items?.find(
                (item) => item.i === widget.id
              );
            });

            return { ...widget, position };
          }),
        };
      });

      const next = {
        ...previous,
        savedLayouts: updatedLayouts,
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error("Unable to auto-save layout:", error);
      }

      return next;
    });
  }, [layouts, loaded]);

  // Debounced auto-save after layout changes.
  useEffect(() => {
    if (!loaded || !storage.activeLayoutId) return;

    const timeout = window.setTimeout(() => {
      persistCurrentLayout();
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [layouts, loaded, storage.activeLayoutId, persistCurrentLayout]);

  // Backup auto-save every 30 seconds.
  useEffect(() => {
    if (!loaded || !storage.activeLayoutId) return;

    const interval = window.setInterval(() => {
      persistCurrentLayout();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loaded, storage.activeLayoutId, persistCurrentLayout]);

  const handleLayoutChange = (
    _currentLayout: Layout[],
    allLayouts: Layouts
  ) => {
    setLayouts(allLayouts);
  };

  // Manual save and create version history.
  const handleSave = () => {
    const name = window.prompt(
      "Enter layout name:",
      activeLayout?.name || "My Dashboard"
    );

    if (!name?.trim()) return;

    const description =
      window.prompt("Enter layout description:", activeLayout?.description || "") ??
      "";

    const document = activeLayout
      ? {
          ...activeLayout,
          name: name.trim(),
          description,
          updatedAt: new Date().toISOString(),
          layouts,
        }
      : createDocument(name.trim(), description, layouts, widgetIds);

    const history = activeLayout
      ? [activeLayout, ...storage.history].slice(0, 10)
      : storage.history.slice(0, 10);

    const savedLayouts = activeLayout
      ? storage.savedLayouts.map((item) =>
          item.id === activeLayout.id ? document : item
        )
      : [...storage.savedLayouts, document];

    writeStorage({
      activeLayoutId: document.id,
      savedLayouts,
      history,
    });

    setSelectedLayoutId(document.id);
    window.alert("Layout saved successfully.");
  };

  // Save current layout as a separate copy.
  const handleSaveAsNew = () => {
    const name = window.prompt("Enter a name for the new layout:");

    if (!name?.trim()) return;

    const description =
      window.prompt("Enter layout description:") ?? "";

    const document = createDocument(
      name.trim(),
      description,
      layouts,
      widgetIds
    );

    writeStorage({
      ...storage,
      activeLayoutId: document.id,
      savedLayouts: [...storage.savedLayouts, document],
    });

    setSelectedLayoutId(document.id);
    window.alert("New layout created successfully.");
  };

  // Load a saved layout.
  const handleLoadLayout = (id: string) => {
    const document = storage.savedLayouts.find((item) => item.id === id);

    if (!document) return;

    setLayouts(document.layouts);
    setSelectedLayoutId(id);

    writeStorage({
      ...storage,
      activeLayoutId: id,
    });
  };

  // Restore an earlier version.
  const handleRestoreVersion = (id: string) => {
    const version = storage.history.find((item) => item.id === id);

    if (!version) return;

    const restored = {
      ...version,
      id: createId(),
      name: `${version.name} (Restored)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLayouts(restored.layouts);

    writeStorage({
      ...storage,
      activeLayoutId: restored.id,
      savedLayouts: [...storage.savedLayouts, restored],
    });

    setSelectedLayoutId(restored.id);
    window.alert("Previous version restored.");
  };

  // Export active layout as JSON.
  const handleExport = () => {
    if (!activeLayout) {
      window.alert("Save your layout first.");
      return;
    }

    const blob = new Blob(
      [JSON.stringify(activeLayout, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${activeLayout.name.replace(/[^a-z0-9]/gi, "_")}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Import a layout JSON file.
  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const parsed: unknown = JSON.parse(await file.text());

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !("layouts" in parsed) ||
        !("widgets" in parsed) ||
        !("version" in parsed)
      ) {
        throw new Error("Invalid layout JSON file.");
      }

      const imported = parsed as SavedLayoutDocument;

      if (!imported.layouts || !Array.isArray(imported.widgets)) {
        throw new Error("Invalid layout structure.");
      }

      const document: SavedLayoutDocument = {
        ...imported,
        id: createId(),
        name: `${imported.name || "Imported Layout"} (Imported)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLayouts(document.layouts);

      writeStorage({
        ...storage,
        activeLayoutId: document.id,
        savedLayouts: [...storage.savedLayouts, document],
      });

      setSelectedLayoutId(document.id);
      window.alert("Layout imported successfully.");
    } catch (error) {
      console.error("Unable to import layout:", error);
      window.alert("Invalid JSON file. Please select a valid Meridian layout.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="analytics-grid-wrapper">
      <div
        className="layout-toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <select
          aria-label="Select saved layout"
          value={selectedLayoutId}
          onChange={(event) => handleLoadLayout(event.target.value)}
        >
          <option value="">Select saved layout</option>
          {storage.savedLayouts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <button type="button" onClick={handleSave}>
          Save Layout
        </button>

        <button type="button" onClick={handleSaveAsNew}>
          Save As New
        </button>

        <button type="button" onClick={handleExport}>
          Export JSON
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={handleImport}
        />

        <select
          aria-label="Layout version history"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              handleRestoreVersion(event.target.value);
              event.target.value = "";
            }
          }}
        >
          <option value="">Version History</option>
          {storage.history.map((item, index) => (
            <option key={`${item.id}-${index}`} value={item.id}>
              {item.name} — {new Date(item.updatedAt).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveGridLayout
        className="analytics-widget-grid"
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLUMNS}
        rowHeight={30}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        draggableHandle=".analytics-widget-card-heading"
        draggableCancel="button, input, select, textarea, a"
        compactType="vertical"
        preventCollision={false}
        resizeHandles={["se"]}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
}
