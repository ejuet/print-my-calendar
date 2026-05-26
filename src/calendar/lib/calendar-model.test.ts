import { Duration, Time } from "ical.js";
import { describe, expect, test } from "vitest";
import { applyEventTitleTemplates, Calendar, CalendarEvent, getEventTitleTemplatesForCalendar } from "./calendar-model";

function createEvent(summary: string) {
	return new CalendarEvent(
		new Time({
			year: 2026,
			month: 5,
			day: 26,
		}),
		Duration.fromSeconds(0),
		summary,
	);
}

describe("event title templates", () => {
	test("applies multiple templates in sequence", () => {
		expect(applyEventTitleTemplates("Birthday", ["🎂 {title}", "[Family] {title}"])).toBe("[Family] 🎂 Birthday");
	});

	test("applies source and merged calendar templates together", () => {
		const workCalendar = new Calendar("Work");
		const familyCalendar = new Calendar("Family");
		const meeting = createEvent("Meeting");
		workCalendar.addEvent(meeting);
		familyCalendar.addEvent(createEvent("Dinner"));
		const mergedCalendar = workCalendar.mergeWithCalendar(familyCalendar);

		const templates = getEventTitleTemplatesForCalendar(meeting, mergedCalendar, {
			[workCalendar.id]: "💼 {title}",
			[mergedCalendar.id]: "[Combined] {title}",
		});

		expect(templates).toEqual(["💼 {title}", "[Combined] {title}"]);
		expect(meeting.getPrettierSummary({}, templates)).toBe("[Combined] 💼 Meeting");
	});

	test("does not apply the same calendar template twice for non-merged calendars", () => {
		const calendar = new Calendar("Birthdays");
		const event = createEvent("Party");
		calendar.addEvent(event);

		const templates = getEventTitleTemplatesForCalendar(event, calendar, {
			[calendar.id]: "🎉 {title}",
		});

		expect(templates).toEqual(["🎉 {title}"]);
		expect(event.getPrettierSummary({}, templates)).toBe("🎉 Party");
	});
});
