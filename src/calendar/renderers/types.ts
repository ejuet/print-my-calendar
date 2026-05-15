import { Time } from "ical.js";
import React from "react";
import { Calendar } from "../lib/calendar-model";

export type RendererCommonProps = {
	startOfCalendar: Time;
	endOfCalendar: Time;
	calendars: Calendar[];
	eventNameReplacements: Record<string, string>;
};

export type RendererPreviewProps<TSettings = unknown> = RendererCommonProps & {
	settings: TSettings;
};

export type RendererSettingsProps<TSettings = unknown> = {
	settings: TSettings;
	setSettings: React.Dispatch<React.SetStateAction<TSettings>>;
};

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
