import React from "react";
import { Time } from "ical.js";
import { Table } from "react-bootstrap";
import { Calendar, CalendarEvent } from "../lib/calendar-model";
import { defaultEventNameReplacements } from "../lib/constants";
import { CalendarDay, getDaysInMonths, Language, mapMonthMap } from "../lib/date";

type PreviewProps = {
	startOfCalendar: Time;
	endOfCalendar: Time;
	calendars: Calendar[];
	previewAmount?: number;
	fontFamily?: string;
	lineHeight?: number;
	calendarWidth?: number;
	fontSize?: number;
	fontSizeHeading?: number;
	eventNameReplacements?: Record<string, string>;
};

type CalendarPreviewProps = PreviewProps & {
	size: number;
	preview: boolean;
};

export function Preview(props: PreviewProps) {
	return <CalendarPreview size={0.1} preview={true} {...props} />;
}

export function CalendarPreview({
	startOfCalendar,
	endOfCalendar,
	calendars,
	size,
	preview,
	previewAmount = 2,
	fontFamily = "PleaseWriteMeASong",
	lineHeight = 400,
	calendarWidth = 100,
	fontSize = 400,
	fontSizeHeading = 100,
	eventNameReplacements = defaultEventNameReplacements,
}: CalendarPreviewProps) {
	const pageWidth = size * 4000 * (calendarWidth / 100);
	const tableFontSize = (lineHeight / 100) * 40 * 0.65 * size * (fontSize / 100);
	const headingFontSize = (lineHeight / 100) * 55 * 0.65 * size * (fontSizeHeading / 100);

	return mapMonthMap(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear, days) => {
		return (
			<div style={{ width: `${pageWidth}px`, margin: "auto" }} key={monthAndYear} className={`calendar ${monthAndYear}`} id={monthAndYear}>
				<p
					style={{
						fontFamily,
						fontSize: `${(lineHeight / 100) * 120 * 0.65 * size * (fontSizeHeading / 100)}px`,
						marginTop: `${size * 0.05}em`,
						marginBottom: `${size * 0.07}em`,
						contentVisibility: "visible",
					}}
					className="monthname"
				>
					{Language.getMonthName(monthAndYear)}
				</p>
				<Table
					bordered
					style={{
						fontSize: `${1.8 * size}em`,
						verticalAlign: "middle",
						padding: "0 px !important",
						fontFamily,
						width: "100%",
						tableLayout: "fixed",
					}}
				>
					<thead>
						<tr style={{ fontSize: (lineHeight / 100) * 40 * 0.65 * size * (fontSizeHeading / 100) }}>
							<th style={{ width: "10%", verticalAlign: "middle" }}>Day</th>
							{calendars.map((cal, i) => {
								return (
									<th
										key={i}
										style={{
											verticalAlign: "middle",
											width: `${(90 / calendars.length) * cal.width}%`,
											height: `${(lineHeight / 100) * 55 * size}px`,
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
					<tbody>{days.map((day, index) => renderDayRow(day, index, { calendars, preview, previewAmount, lineHeight, size, fontSize, tableFontSize, eventNameReplacements }))}</tbody>
				</Table>
			</div>
		);
	});
}

function renderDayRow(
	day: CalendarDay,
	index: number,
	{
		calendars,
		preview,
		previewAmount,
		lineHeight,
		size,
		fontSize,
		tableFontSize,
		eventNameReplacements,
	}: {
		calendars: Calendar[];
		preview: boolean;
		previewAmount: number;
		lineHeight: number;
		size: number;
		fontSize: number;
		tableFontSize: number;
		eventNameReplacements: Record<string, string>;
	},
) {
	if(preview) {
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
	}

	const tdstyle = {
		backgroundColor:
			day.toJSDate().getDay() === 6 || day.toJSDate().getDay() === 0
				? "#b8b8b8"
				: day.toJSDate().getDay() % 2 === 0
					? "#dedede"
					: "white",
		height: `${(lineHeight / 100) * 40 * size}px`,
		fontSize: `${tableFontSize}px`,
		lineHeight: 1.1,
		verticalAlign: "middle",
	};

	return (
		<tr key={day.toString()}>
			<td className="day" style={tdstyle}>
				<div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
					<b style={{ fontSize: `${(lineHeight / 100) * 33 * 0.65 * size * (fontSize / 100)}px` }}>
						{`${Language.getWeekdayName(day).slice(0, 2)} ${day.day}`}
					</b>
				</div>
			</td>
			{calendars.map((cal, i) => renderEventCell(cal, day, i, { tdstyle, eventNameReplacements }))}
		</tr>
	);
}

function renderEventCell(
	cal: Calendar,
	day: Time,
	index: number,
	{ tdstyle, eventNameReplacements }: { tdstyle: React.CSSProperties; eventNameReplacements: Record<string, string> },
) {
	const content = cal
		.getEvents(day)
		.map((ev: CalendarEvent) => ev.getFullSummary(eventNameReplacements))
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
