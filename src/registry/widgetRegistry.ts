
import type {
  WidgetDefinition,
  WidgetId,
} from "../types/widget";

const widgetRegistry = new Map<WidgetId, WidgetDefinition>();

export function registerWidget(widget: WidgetDefinition): void {
  if (widgetRegistry.has(widget.id)) {
    throw new Error(`Widget ${widget.id} is already registered.`);
  }

  widgetRegistry.set(widget.id, widget);
}

export function getWidget(id: WidgetId): WidgetDefinition | undefined {
  return widgetRegistry.get(id);
}

export function getAllWidgets(): WidgetDefinition[] {
  return Array.from(widgetRegistry.values());
}

export function unregisterWidget(id: WidgetId): boolean {
  return widgetRegistry.delete(id);
}
