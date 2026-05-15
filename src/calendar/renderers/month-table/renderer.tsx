import React from "react";
import { Time } from "ical.js";
import { Table } from "react-bootstrap";
import { Calendar, CalendarEvent } from "../../lib/calendar-model";
import { getDaysInMonths, Language, mapMonthMap } from "../../lib/date";
import { RendererPreviewProps } from "../types";
import { MonthTableRendererSettings } from "./settings";

export function MonthTablePreview(props: RendererPreviewProps<MonthTableRendererSettings>) {
	const { startOfCalendar, endOfCalendar, calendars, eventNameReplacements, eventTitleTemplatesByCalendar, settings } = props;
	const pageWidth = 0.1 * 4000 * (settings.calendarWidth / 100);
	const tableFontSize = (settings.lineHeight / 100) * 40 * 0.65 * 0.1 * (settings.fontSize / 100);
	const headingFontSize = (settings.lineHeight / 100) * 55 * 0.65 * 0.1 * (settings.fontSizeHeading / 100);

	return mapMonthMap(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear, days) => {
		return (
			<div style={{ width: `${pageWidth}px`, margin: "auto" }} key={monthAndYear} className={`calendar ${monthAndYear}`} id={monthAndYear}>
				<p
					style={{
						fontFamily: settings.fontFamily,
						fontSize: `${(settings.lineHeight / 100) * 120 * 0.65 * 0.1 * (settings.fontSizeHeading / 100)}px`,
						marginTop: `${0.1 * 0.05}em`,
						marginBottom: `${0.1 * 0.07}em`,
						contentVisibility: "visible",
					}}
					className="monthname"
				>
					{Language.getMonthName(monthAndYear)}
				</p>
				<Table
					bordered
					style={{
						fontSize: `${1.8 * 0.1}em`,
						verticalAlign: "middle",
						padding: "0 px !important",
						fontFamily: settings.fontFamily,
						width: "100%",
						tableLayout: "fixed",
					}}
				>
					<thead>
						<tr style={{ fontSize: (settings.lineHeight / 100) * 40 * 0.65 * 0.1 * (settings.fontSizeHeading / 100) }}>
							<th style={{ width: "10%", verticalAlign: "middle" }}>Day</th>
							{calendars.map((cal, i) => {
								return (
									<th
										key={i}
										style={{
											verticalAlign: "middle",
											width: `${(90 / calendars.length) * cal.width}%`,
											height: `${(settings.lineHeight / 100) * 55 * 0.1}px`,
											fontSize: `${headingFontSize}px`,
											lineHeight: 1.1,
											overflowWrap: "anywhere",
										}}
									>
										{cal.name}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{days.map((day, index) =>
							renderDayRow(day, index, {
								calendars,
								previewAmount: settings.previewAmount,
								lineHeight: settings.lineHeight,
								fontSize: settings.fontSize,
								tableFontSize,
								eventNameReplacements,
								eventTitleTemplatesByCalendar,
							}),
						)}
					</tbody>
				</Table>
			</div>
		);
	});
}

function renderDayRow(
	day: Time,
	index: number,
	{
		calendars,
		previewAmount,
		lineHeight,
		fontSize,
		tableFontSize,
		eventNameReplacements,
		eventTitleTemplatesByCalendar,
	}: {
		calendars: Calendar[];
		previewAmount: number;
		lineHeight: number;
		fontSize: number;
		tableFontSize: number;
		eventNameReplacements: Record<string, string>;
		eventTitleTemplatesByCalendar: Record<string, string>;
	},
) {
	if(index === previewAmount) {
		return (
			<tr key={`${day.toString()}-ellipsis`}>
				<td>...</td>
			</tr>
		);
	}
	if(index > previewAmount) {
		return null;
	}

	const tdstyle = {
		backgroundColor:
			day.toJSDate().getDay() === 6 || day.toJSDate().getDay() === 0
				? "#b8b8b8"
				: day.toJSDate().getDay() % 2 === 0
					? "#dedede"
					: "white",
		height: `${(lineHeight / 100) * 40 * 0.1}px`,
		fontSize: `${tableFontSize}px`,
		lineHeight: 1.1,
		verticalAlign: "middle" as const,
	};

	return (
		<tr key={day.toString()}>
			<td className="day" style={tdstyle}>
				<div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
					<b style={{ fontSize: `${(lineHeight / 100) * 33 * 0.65 * 0.1 * (fontSize / 100)}px` }}>
						{`${Language.getWeekdayName(day).slice(0, 2)} ${day.day}`}
					</b>
				</div>
			</td>
			{calendars.map((cal, i) => renderEventCell(cal, day, i, { tdstyle, eventNameReplacements, eventTitleTemplatesByCalendar }))}
		</tr>
	);
}

function renderEventCell(
	cal: Calendar,
	day: Time,
	index: number,
	{
		tdstyle,
		eventNameReplacements,
		eventTitleTemplatesByCalendar,
	}: {
		tdstyle: React.CSSProperties;
		eventNameReplacements: Record<string, string>;
		eventTitleTemplatesByCalendar: Record<string, string>;
	},
) {
	const titleTemplate = eventTitleTemplatesByCalendar[cal.id] ?? "";
	const content = cal
		.getEvents(day)
		.map((ev: CalendarEvent) => ev.getFullSummary(eventNameReplacements, titleTemplate))
		.join(", ");

	return (
		<td
			key={index}
			style={{
				...tdstyle,
				overflowWrap: "anywhere",
				wordBreak: "break-word",
				whiteSpace: "normal",
			}}
		>
			<div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>{content}</div>
		</td>
	);
}
