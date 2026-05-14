import { Component, Event, parse } from "ical.js";
import { Calendar, CalendarEvent } from "./calendar-model";

export function exampleReadICS(textcontent: string) {
	const calendar = new Calendar("Aaaa");
	const data = parse(textcontent);
	const vcal = new Component(data);

	let defaultCalendarName = vcal.getFirstProperty("x-wr-calname")?.getFirstValue();
	if(!vcal.getFirstProperty("x-wr-calname")) {
		defaultCalendarName = "New Calendar";
	}
	calendar.name = defaultCalendarName;

	const events = vcal.getAllSubcomponents("vevent");
	for(let j = 0; j < events.length; j++) {
		const event = new Event(events[j]);
		const iterator = event.iterator(event.startDate);

		for(let next = iterator.next(); next; next = iterator.next()) {
			const calendarEvent = new CalendarEvent(next, event.duration, event.summary);
			calendar.addEvent(calendarEvent);

			if(calendarEvent.startDate.toJSDate().getFullYear() > new Date().getFullYear() + 15) {
				break;
			}
		}
	}

	return calendar;
}
