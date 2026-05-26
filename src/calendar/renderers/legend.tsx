import React from "react";
import { Calendar } from "../lib/calendar-model";

export const LEGEND_PAGE_ID = "calendar-legend";

type LegendData = {
	replacements: Array<{ from: string; to: string }>;
	templates: Array<{ label: string; template: string }>;
};

type LegendProps = {
	data: LegendData;
	fontFamily: string;
	fontSize?: number;
};

export function buildLegendData(
	calendars: Calendar[],
	eventNameReplacements: Record<string, string>,
	eventTitleTemplatesByCalendar: Record<string, string>,
): LegendData {
	const replacements = Object.entries(eventNameReplacements)
		.filter(([from, to]) => from.trim() !== "" && to.trim() !== "")
		.map(([from, to]) => ({ from, to }))
		.sort((left, right) => left.from.localeCompare(right.from));

	const templates: Array<{ label: string; template: string }> = [];
	const seenCalendarIds = new Set<string>();

	for(const calendar of calendars) {
		addTemplateEntry(templates, seenCalendarIds, calendar.id, calendar.name, eventTitleTemplatesByCalendar[calendar.id]);

		if(calendar.getIsMerged()) {
			for(const sourceCalendar of calendar.getSourceCalendars()) {
				addTemplateEntry(
					templates,
					seenCalendarIds,
					sourceCalendar.id,
					`${sourceCalendar.name}`,
					eventTitleTemplatesByCalendar[sourceCalendar.id],
				);
			}
		}
	}

	return { replacements, templates };
}

function addTemplateEntry(
	templates: Array<{ label: string; template: string }>,
	seenCalendarIds: Set<string>,
	calendarId: string,
	label: string,
	template: string | undefined,
) {
	if(seenCalendarIds.has(calendarId) || !template?.trim()) {
		return;
	}

	seenCalendarIds.add(calendarId);
	templates.push({ label: label.trim() || "Untitled column", template: template.trim() });
}

export function estimateLegendHeight(data: LegendData, availableWidthPx: number, fontSize = 12) {
	if(data.replacements.length === 0 && data.templates.length === 0) {
		return 0;
	}

	const charsPerLine = Math.max(28, Math.floor(availableWidthPx / (fontSize * 0.62)));
	let totalLines = 1; // legend heading

	if(data.replacements.length > 0) {
		totalLines += 1; // section heading
		totalLines += data.replacements.reduce((sum, replacement) => sum + getApproximateLineCount(`${replacement.from} -> ${replacement.to}`, charsPerLine), 0);
	}

	if(data.templates.length > 0) {
		totalLines += 1; // section heading
		totalLines += data.templates.reduce((sum, template) => sum + getApproximateLineCount(`${template.label}: ${template.template}`, charsPerLine), 0);
	}

	return totalLines * (fontSize + 5) + 18;
}

function getApproximateLineCount(text: string, charsPerLine: number) {
	return Math.max(1, Math.ceil(text.length / charsPerLine));
}

export function CalendarLegend({ data, fontFamily, fontSize = 12 }: LegendProps) {
	if(data.replacements.length === 0 && data.templates.length === 0) {
		return null;
	}

	return (
		<div
			style={{
				marginTop: "12px",
				paddingTop: "8px",
				fontFamily,
				fontSize: `${fontSize}px`,
				lineHeight: 1.35,
				color: "#1f1f1f",
			}}
		>
			<div style={{ fontSize: `${fontSize * 2}px`, fontWeight: 700, marginBottom: "4px" }}>Legende</div>
			{data.replacements.length > 0 ? (
				<div style={{ marginBottom: data.templates.length > 0 ? "6px" : 0 }}>
					<div style={{ fontWeight: 700 }}>Ersetzungen von Einträgen</div>
					{data.replacements.map((replacement) => (
						<div key={`${replacement.from}-${replacement.to}`}>{`${replacement.from} ➡ ${replacement.to}`}</div>
					))}
				</div>
			) : null}
			{data.templates.length > 0 ? (
				<div>
					<div style={{ fontWeight: 700 }}>Anpassungen von Einträgen</div>
					{data.templates.map((template) => (
						<div key={`${template.label}-${template.template}`}>{`${template.label}: `}<span style={{ color: "#868686" }}>{template.template.replace("{title}", "<Terminname>")}</span></div>
					))}
				</div>
			) : null}
		</div>
	);
}

export function LegendPage({
	data,
	fontFamily,
	title = "Legend",
	pageId = LEGEND_PAGE_ID,
	pageWidthPx,
	pageHeightPx,
	padding,
	contentWidth = "100%",
}: LegendProps & {
	title?: string;
	pageId?: string;
	pageWidthPx: number;
	pageHeightPx: number;
	padding: string;
	contentWidth?: string;
}) {
	if(data.replacements.length === 0 && data.templates.length === 0) {
		return null;
	}

	return (
		<div
			id={pageId}
			className="calendar calendar-legend"
			style={{
				width: `${pageWidthPx}px`,
				height: `${pageHeightPx}px`,
				margin: "24px auto",
				padding,
				boxSizing: "border-box",
				backgroundColor: "#ffffff",
				boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
				overflow: "hidden",
			}}
		>
			<div style={{ width: contentWidth, margin: "0 auto" }}>
				<CalendarLegend data={data} fontFamily={fontFamily} fontSize={20} />
			</div>
		</div>
	);
}
