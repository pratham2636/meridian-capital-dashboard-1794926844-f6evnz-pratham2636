
import type { ComponentType } from "react";

export type WidgetId =
  | "W01"
  | "W02"
  | "W03"
  | "W04"
  | "W05"
  | "W06"
  | "W07"
  | "W08"
  | "W09"
  | "W10"
  | "W11"
  | "W12";

export type WidgetCategory =
  | "portfolio"
  | "performance"
  | "market"
  | "risk"
  | "research";

export interface WidgetSettings {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface WidgetProps {
  settings: WidgetSettings;
}

export interface WidgetDefinition {
  id: WidgetId;
  title: string;
  description: string;
  category: WidgetCategory;
  component: ComponentType<WidgetProps>;
  defaultSettings: WidgetSettings;
  configurable: boolean;
}
