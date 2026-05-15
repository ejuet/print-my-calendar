import { Time } from "ical.js";
import React from "react";
import { Calendar } from "../lib/calendar-model";

export type RendererCommonProps = {
	startOfCalendar: Time;
	endOfCalendar: Time;
	calendars: Calendar[];
	eventNameReplacements: Record<string, string>;
	eventTitleTemplatesByCalendar: Record<string, string>;
};

/**
 * Props for the react component that renders the preview of a calendar renderer.
 */
export type RendererPreviewProps<TSettings = unknown> = RendererCommonProps & {
	settings: TSettings;
};

/**
 * Props for the react component that renders the display settings of a calendar renderer.
 * It includes the current settings and a function to update the settings.
 */
export type RendererSettingsProps<TSettings = unknown> = {
	settings: TSettings;
	setSettings: React.Dispatch<React.SetStateAction<TSettings>>;
};

/**
 * Represents a calendar renderer, which is responsible for rendering the calendar
 * in a specific format (e.g., month table, week view, etc.)
 * and providing the necessary components for previewing and configuring the renderer.
 */
export interface CalendarRenderer<TSettings = unknown> {
	id: string;
	name: string;
	createDefaultSettings: () => TSettings;
	PreviewComponent: React.ComponentType<RendererPreviewProps<TSettings>>;
	SettingsComponent: React.ComponentType<RendererSettingsProps<TSettings>>;
	savePdf: (props: RendererPreviewProps<TSettings>) => Promise<void>;
}

export function defineRenderer<TSettings>(renderer: CalendarRenderer<TSettings>) {
	return renderer as CalendarRenderer;
}
