import React from "react";
import { Time } from "ical.js";
import { Calendar, CalendarEvent } from "../../lib/calendar-model";
import { getDaysInMonths, Language, mapMonthMap } from "../../lib/date";
import { RendererPreviewProps } from "../types";
import { MonthColumnsRendererSettings } from "./settings";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PAGE_PADDING_X_PX = 18;
const PAGE_PADDING_TOP_PX = 10;
const PAGE_PADDING_BOTTOM_PX = 16;
const MONTH_TITLE_HEIGHT_PX = 60;
const MONTH_TITLE_MARGIN_BOTTOM_PX = 8;

export function MonthColumnsPreview(props: RendererPreviewProps<MonthColumnsRendererSettings>) {
	const { startOfCalendar, endOfCalendar, calendars, eventNameReplacements, settings } = props;

	return mapMonthMap(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear, days) => {
		const availableTableHeight =
			A4_HEIGHT_PX - PAGE_PADDING_TOP_PX - PAGE_PADDING_BOTTOM_PX - MONTH_TITLE_HEIGHT_PX - MONTH_TITLE_MARGIN_BOTTOM_PX;
		const tableHeaderHeight = Math.max(28, Math.floor(availableTableHeight / (days.length + 1.1)));
		const rowHeight = Math.max(26, Math.floor((availableTableHeight - tableHeaderHeight) / days.length));
		const bodyFontSize = Math.max(14, Math.floor(rowHeight * 0.8));
		const dayFontSize = Math.max(14, Math.floor(rowHeight * 0.8));
		const headingFontSize = Math.max(12, Math.floor(tableHeaderHeight * 0.8));
		const monthFontSize = Math.max(30, Math.floor(MONTH_TITLE_HEIGHT_PX * 0.9));

		return (
			<div
				key={monthAndYear}
				id={monthAndYear}
				className={`calendar ${monthAndYear}`}
				style={{
					width: `${A4_WIDTH_PX}px`,
					height: `${A4_HEIGHT_PX}px`,
					margin: "24px auto",
					padding: `${PAGE_PADDING_TOP_PX}px ${PAGE_PADDING_X_PX}px ${PAGE_PADDING_BOTTOM_PX}px`,
					boxSizing: "border-box",
					backgroundColor: "#ffffff",
					boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
					overflow: "hidden",
				}}
			>
				<div
					className="monthname"
					style={{
						height: `${MONTH_TITLE_HEIGHT_PX}px`,
						marginBottom: `${MONTH_TITLE_MARGIN_BOTTOM_PX}px`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontFamily: settings.fontFamily,
						fontSize: `${monthFontSize}px`,
						fontWeight: 700,
						letterSpacing: "0.02em",
						lineHeight: 1,
					}}
				>
					{Language.getMonthName(monthAndYear)}
				</div>
				<table
					style={{
						width: "100%",
						height: `${availableTableHeight}px`,
						borderCollapse: "separate",
						borderSpacing: 0,
						tableLayout: "fixed",
						fontFamily: settings.fontFamily,
					}}
				>
					<thead>
						<tr>
							<th style={getHeaderStyle({ width: "12%", height: tableHeaderHeight, fontSize: headingFontSize })}>Day</th>
							{calendars.map((calendar, index) => (
								<th
									key={index}
									style={getHeaderStyle({
										width: `${(88 / calendars.length) * calendar.width}%`,
										height: tableHeaderHeight,
										fontSize: headingFontSize,
									})}
								>
									{calendar.name}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{days.map((day) =>
							renderDayRow(day, {
								calendars,
								eventNameReplacements,
								rowHeight,
								bodyFontSize,
								dayFontSize,
							}),
						)}
					</tbody>
				</table>
			</div>
		);
	});
}

function renderDayRow(
	day: Time,
	{
		calendars,
		eventNameReplacements,
		rowHeight,
		bodyFontSize,
		dayFontSize,
	}: {
		calendars: Calendar[];
		eventNameReplacements: Record<string, string>;
		rowHeight: number;
		bodyFontSize: number;
		dayFontSize: number;
	},
) {
	const backgroundColor =
		day.toJSDate().getDay() === 6 || day.toJSDate().getDay() === 0
			? "#d9d9d9"
			: day.toJSDate().getDay() % 2 === 0
				? "#efefef"
				: "#ffffff";

	const cellStyle: React.CSSProperties = {
		boxShadow: "inset 0 -1px 0 #1f1f1f, inset -1px 0 0 #1f1f1f",
		backgroundColor,
		height: `${rowHeight}px`,
		padding: "0 4px",
		verticalAlign: "middle",
		fontSize: `${bodyFontSize}px`,
		lineHeight: 0.95,
		overflowWrap: "anywhere",
		wordBreak: "break-word",
		position: "relative",
		overflow: "visible",
	};

	return (
		<tr key={day.toString()}>
			<td style={{ ...cellStyle, boxShadow: "inset 1px 0 0 #1f1f1f, inset 0 -1px 0 #1f1f1f, inset -1px 0 0 #1f1f1f", textAlign: "center", fontWeight: 700, fontSize: `${dayFontSize}px` }}>
				<span style={{ position: "relative", zIndex: 1 }}>{`${Language.getWeekdayName(day).slice(0, 2)} ${day.day}`}</span>
			</td>
			{calendars.map((calendar, index) => renderEventCell(calendar, day, index, { cellStyle, eventNameReplacements, rowHeight }))}
		</tr>
	);
}

function renderEventCell(
	calendar: Calendar,
	day: Time,
	index: number,
	{
		cellStyle,
		eventNameReplacements,
		rowHeight,
	}: { cellStyle: React.CSSProperties; eventNameReplacements: Record<string, string>; rowHeight: number },
) {
	const content = calendar
		.getEvents(day)
		.map((event: CalendarEvent) => event.getFullSummary(eventNameReplacements))
		.join(", ");

	return (
		<td key={index} style={cellStyle}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: `${rowHeight - 2}px`,
					textAlign: "center",
					position: "relative",
					zIndex: 1,
					overflow: "visible",
				}}
			>
				<span
					style={{
						display: "-webkit-box",
						WebkitBoxOrient: "vertical",
						WebkitLineClamp: 2,
						overflow: "visible",
						textOverflow: "unset",
						position: "relative",
						zIndex: 1,
					}}
				>
					{content}
				</span>
			</div>
		</td>
	);
}

function getHeaderStyle({ width, height, fontSize }: { width: string; height: number; fontSize: number }): React.CSSProperties {
	return {
		width,
		height: `${height}px`,
		boxShadow: "inset 1px 0 0 #1f1f1f, inset 0 -1px 0 #1f1f1f, inset -1px 0 0 #1f1f1f, inset 0 1px 0 #1f1f1f",
		padding: "2px 4px",
		backgroundColor: "#f6f6f6",
		fontSize: `${fontSize}px`,
		lineHeight: 0.95,
		fontWeight: 700,
		verticalAlign: "middle",
		overflowWrap: "anywhere",
		wordBreak: "break-word",
		textAlign: "center",
		position: "relative",
		overflow: "visible",
	};
}
