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
const MULTI_DAY_BAR_WIDTH_PX = 20;
const MULTI_DAY_BAR_GAP_PX = 4;
const MULTI_DAY_LABEL_OFFSET_PX = 8;
const MULTI_DAY_LABEL_TRACK_WIDTH_PX = 18;

type MultiDaySpan = {
	startIndex: number;
	endIndex: number;
	lane: number;
	label: string;
};

type CalendarMonthLayout = {
	spansByStartIndex: Map<number, MultiDaySpan[]>;
	activeLaneCountByDay: number[];
};

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
		const calendarLayouts = calendars.map((calendar) => createCalendarMonthLayout(calendar, days, eventNameReplacements));

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
						{days.map((day, dayIndex) =>
							renderDayRow(day, {
								calendars,
								calendarLayouts,
								eventNameReplacements,
								rowHeight,
								bodyFontSize,
								dayFontSize,
								dayIndex,
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
		calendarLayouts,
		eventNameReplacements,
		rowHeight,
		bodyFontSize,
		dayFontSize,
		dayIndex,
	}: {
		calendars: Calendar[];
		calendarLayouts: CalendarMonthLayout[];
		eventNameReplacements: Record<string, string>;
		rowHeight: number;
		bodyFontSize: number;
		dayFontSize: number;
		dayIndex: number;
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
			{calendars.map((calendar, index) =>
				renderEventCell(calendar, day, index, {
					cellStyle,
					eventNameReplacements,
					rowHeight,
					layout: calendarLayouts[index],
					dayIndex,
					bodyFontSize,
				}),
			)}
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
		layout,
		dayIndex,
		bodyFontSize,
	}: {
		cellStyle: React.CSSProperties;
		eventNameReplacements: Record<string, string>;
		rowHeight: number;
		layout: CalendarMonthLayout;
		dayIndex: number;
		bodyFontSize: number;
	},
) {
	const content = calendar
		.getEvents(day)
		.filter((event: CalendarEvent) => !event.isMultipleDaysLong())
		.map((event: CalendarEvent) => event.getFullSummary(eventNameReplacements))
		.join(", ");
	const activeLaneCount = layout.activeLaneCountByDay[dayIndex] ?? 0;
	const leadingInset = activeLaneCount > 0 ? activeLaneCount * (MULTI_DAY_BAR_WIDTH_PX + MULTI_DAY_BAR_GAP_PX) + MULTI_DAY_LABEL_OFFSET_PX : 0;
	const startingSpans = layout.spansByStartIndex.get(dayIndex) ?? [];

	return (
		<td key={index} style={cellStyle}>
			{startingSpans.map((span) => {
				const barLeft = span.lane * (MULTI_DAY_BAR_WIDTH_PX + MULTI_DAY_BAR_GAP_PX) + MULTI_DAY_BAR_GAP_PX;
				const spanHeight = Math.max(0, (span.endIndex - span.startIndex + 1) * rowHeight - 4);
				const labelFontSize = Math.max(11, Math.floor(bodyFontSize * 0.8));
				return (
					<React.Fragment key={`${span.label}-${span.startIndex}-${span.endIndex}-${span.lane}`}>
						<div
							style={{
								position: "absolute",
								left: `${barLeft}px`,
								top: "2px",
								height: `${spanHeight}px`,
								width: `${MULTI_DAY_BAR_WIDTH_PX}px`,
								backgroundColor: "#1f1f1f",
								borderRadius: `${Math.ceil(MULTI_DAY_BAR_WIDTH_PX / 2)}px`,
								zIndex: 2,
								pointerEvents: "none",
							}}
						/>
						<div
							style={{
								position: "absolute",
								top: "2px",
								left: `${barLeft + MULTI_DAY_BAR_WIDTH_PX + MULTI_DAY_LABEL_OFFSET_PX}px`,
								width: `${MULTI_DAY_LABEL_TRACK_WIDTH_PX}px`,
								height: `${spanHeight}px`,
								overflow: "hidden",
								zIndex: 2,
								pointerEvents: "none",
							}}
						>
							<span
								style={{
									position: "absolute",
									top: "0",
									left: `${labelFontSize}px`,
									display: "block",
									transform: "rotate(90deg)",
									transformOrigin: "top left",
									whiteSpace: "nowrap",
									fontSize: `${labelFontSize}px`,
									lineHeight: 1,
									fontWeight: 700,
									color: "#1f1f1f",
								}}
							>
								{buildContinuousSpanLabel(span.label, spanHeight, labelFontSize)}
							</span>
						</div>
					</React.Fragment>
				);
			})}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: `${rowHeight - 2}px`,
					paddingLeft: `${leadingInset}px`,
					paddingRight: "4px",
					textAlign: "center",
					position: "relative",
					zIndex: 3,
					overflow: "visible",
					boxSizing: "border-box",
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

function createCalendarMonthLayout(calendar: Calendar, days: Time[], eventNameReplacements: Record<string, string>): CalendarMonthLayout {
	const spansByStartIndex = new Map<number, MultiDaySpan[]>();
	const activeLaneCountByDay = new Array(days.length).fill(0);
	const dayKeys = days.map((day) => day.toJSDate().toDateString());
	const dayIndexByKey = new Map(dayKeys.map((key, index) => [key, index]));
	const monthStart = days[0].toJSDate();
	const monthEnd = days[days.length - 1].toJSDate();

	const multiDayEvents = calendar
		.getAllEvents()
		.filter((event) => event.isMultipleDaysLong())
		.map((event) => {
			const effectiveEnd = getEffectiveMultiDayEndDate(event);

			if(event.startDate.toJSDate() > monthEnd || effectiveEnd < monthStart) {
				return null;
			}

			const startIndex = dayIndexByKey.get(clampDateToMonth(event.startDate.toJSDate(), monthStart, monthEnd).toDateString());
			const endIndex = dayIndexByKey.get(clampDateToMonth(effectiveEnd, monthStart, monthEnd).toDateString());

			if(startIndex == null || endIndex == null || endIndex < startIndex) {
				return null;
			}

			return {
				startIndex,
				endIndex,
				label: event.getFullSummary(eventNameReplacements),
			};
		})
		.filter((event): event is Omit<MultiDaySpan, "lane"> => event !== null)
		.sort((left, right) => left.startIndex - right.startIndex || right.endIndex - left.endIndex || left.label.localeCompare(right.label));

	const laneEndByIndex: number[] = [];

	for(const span of multiDayEvents) {
		let lane = laneEndByIndex.findIndex((endIndex) => endIndex < span.startIndex);
		if(lane === -1) {
			lane = laneEndByIndex.length;
			laneEndByIndex.push(span.endIndex);
		} else {
			laneEndByIndex[lane] = span.endIndex;
		}

		const placedSpan: MultiDaySpan = { ...span, lane };
		const spansAtStart = spansByStartIndex.get(span.startIndex) ?? [];
		spansAtStart.push(placedSpan);
		spansByStartIndex.set(span.startIndex, spansAtStart);

		for(let dayIndex = span.startIndex; dayIndex <= span.endIndex; dayIndex++) {
			activeLaneCountByDay[dayIndex] = Math.max(activeLaneCountByDay[dayIndex], lane + 1);
		}
	}

	return { spansByStartIndex, activeLaneCountByDay };
}

function clampDateToMonth(date: Date, monthStart: Date, monthEnd: Date) {
	if(date < monthStart) {
		return new Date(monthStart);
	}
	if(date > monthEnd) {
		return new Date(monthEnd);
	}
	return new Date(date);
}

function getEffectiveMultiDayEndDate(event: CalendarEvent) {
	const effectiveEnd = new Date(event.endDate.toJSDate());

	if(effectiveEnd.getHours() === 0 && effectiveEnd.getMinutes() === 0 && effectiveEnd.getSeconds() === 0) {
		effectiveEnd.setDate(effectiveEnd.getDate() - 1);
	}

	return effectiveEnd;
}

function buildContinuousSpanLabel(label: string, spanHeight: number, fontSize: number) {
	const trimmedLabel = label.trim();
	if(trimmedLabel === "") {
		return "";
	}

	const segment = `${trimmedLabel}${"\u00A0".repeat(9)}`; // 9 whitespace characters
	const estimatedSegmentHeight = Math.max(segment.length * fontSize * 0.56, fontSize * 3);
	const repetitions = Math.max(4, Math.ceil((spanHeight + fontSize * 2) / estimatedSegmentHeight) + 2);

	return segment.repeat(repetitions).trim();
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
