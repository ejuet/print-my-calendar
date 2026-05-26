import { Time, Timezone } from "ical.js";
import { defaultEventNameReplacements, defaultLanguage, nicerTrashcanNames, useUmlaute } from "./constants";

let calendarIdCounter = 0;

export function applyEventTitleTemplate(title: string, template = "") {
	if(template.trim() === "") {
		return title;
	}

	if(template.includes("{title}")) {
		return template.replaceAll("{title}", title);
	}

	return `${template} ${title}`.trim();
}

export class CalendarEvent {
	startDate: any;
	summary: string;
	duration: any;
	durationInSeconds: number;
	endDate: any;
	private summaryPrefix: string;
	private istrash: boolean;
	private belongsToCalendars!: Calendar;

	constructor(startDate: any, duration: any, summary: string) {
		this.startDate = startDate;
		this.duration = duration;
		this.durationInSeconds = duration.toSeconds();
		this.summary = summary.trim();
		this.endDate = startDate.clone();
		this.summaryPrefix = "";
		this.endDate.addDuration(duration);

		this.istrash = Object.keys(defaultEventNameReplacements).some((key) => this.summary === key);
	}

	addedToCalendar(cal: Calendar) {
		this.belongsToCalendars = cal;
	}

	getCalendar() {
		return this.belongsToCalendars;
	}

	setSummaryPrefix(prefix: string) {
		this.summaryPrefix = prefix;
	}

	getPrettierSummary(replacements: Record<string, string> = defaultEventNameReplacements, titleTemplate = "") {
		let result = this.summary;

		if(nicerTrashcanNames) {
			Object.keys(replacements).forEach((key) => {
				result = result.replaceAll(key, replacements[key]);
			});
		}

		if(useUmlaute) {
			result = result.replaceAll("ae", "ä");
		}

		return applyEventTitleTemplate(result, titleTemplate);
	}

	isTrash() {
		return this.istrash;
	}

	isToday(date: Time) {
		const utcTimezone = Timezone.utcTimezone;
		return (
			date.compareDateOnlyTz(this.startDate, utcTimezone) >= 0 &&
			date.compareDateOnlyTz(this.endDate, utcTimezone) <= 0 &&
			(this.isFullDayEvent() ? date.compareDateOnlyTz(this.endDate, utcTimezone) < 0 : true)
		);
	}

	isFullDayEvent() {
		if(this.startDate.isDate && this.endDate.isDate) {
			return this.endDate.subtractDate(this.startDate).toSeconds() === 24 * 60 * 60;
		}

		// Fallback for events that e.g. go from 00:00 to 00:00 the next day, but are not marked as date-only
		const start = this.startDate.toJSDate();
		const end = this.endDate.toJSDate();

		return (
			Math.abs((start.valueOf() - end.valueOf()) / (1000 * 60 * 60 * 24)) === 1 &&
			start.getHours() === 0 &&
			end.getHours() === 0 &&
			start.getMinutes() === 0 &&
			end.getMinutes() === 0
		);
	}

	isMultipleDaysLong() {
		return this.startDate.compareDateOnlyTz(this.endDate, Timezone.localTimezone) < 0 && !this.isFullDayEvent();
	}

	isBeginningDate(date: Time) {
		return this.isMultipleDaysLong() && this.startDate.compareDateOnlyTz(date, Timezone.localTimezone) === 0;
	}

	isEndDate(date: Time) {
		return this.isMultipleDaysLong() && this.endDate.compareDateOnlyTz(date, Timezone.localTimezone) === 0;
	}

	getFullSummary(replacements: Record<string, string> = defaultEventNameReplacements, titleTemplate = "") {
		const startTime =
			this.startDate.hour !== 0 || this.startDate.minute !== 0 || this.startDate.second !== 0
				? this.startDate.toJSDate().toLocaleTimeString(defaultLanguage)
				: "";

		const endTime =
			this.endDate.hour !== 0 || this.endDate.minute !== 0 || this.endDate.second !== 0
				? this.endDate.toJSDate().toLocaleTimeString(defaultLanguage)
				: "";

		let timeLabel = "";

		if(startTime !== "" && endTime === "") {
			timeLabel = `ab ${startTime}`;
		} else if(startTime === "" && endTime !== "") {
			timeLabel = `bis ${endTime}`;
		} else if(startTime !== "" && endTime !== "") {
			timeLabel = `${startTime} bis ${endTime}`;
		}

		if(timeLabel !== "") {
			timeLabel = ` (${timeLabel})`;
		}

		return `${this.summaryPrefix}${this.getPrettierSummary(replacements, titleTemplate)}${timeLabel}`;
	}
}

export class Calendar {
	id: string;
	items: CalendarEvent[];
	name: string;
	private isMerged: boolean;
	width: number;
	eventCache: Map<string, CalendarEvent[]>;

	constructor(name: string) {
		this.id = `calendar-${calendarIdCounter++}`;
		this.items = [];
		this.name = name;
		this.isMerged = false;
		this.width = 1;
		this.eventCache = new Map();
	}

	addEvent(ev: CalendarEvent) {
		ev.addedToCalendar(this);
		this.items.push(ev);

		if(ev.isMultipleDaysLong()) {
			console.warn("Event spans multiple days, not adding to event map:", ev);
		} else {
			this.addToEventMap(ev.startDate.toJSDate(), ev);
		}
	}

	addToEventMap(date: Date, ev: CalendarEvent) {
		const dateKey = date.toDateString();
		if(!this.eventCache.has(dateKey)) {
			this.eventCache.set(dateKey, []);
		}
		this.eventCache.get(dateKey)!.push(ev);
	}

	getIsMerged() {
		return this.isMerged;
	}

	getEvents(date: Time) {
		return this.eventCache.get(date.toJSDate().toDateString()) ?? [];
	}

	getAllEvents() {
		return this.items;
	}

	getMinMaxStartDate(mult: number) {
		if(this.items.length === 0) {
			return null;
		}

		let current = this.items[0];
		for(let i = 1; i < this.items.length; i++) {
			if(this.items[i].startDate.compare(current.startDate) * mult < 0) {
				current = this.items[i];
			}
		}
		return current;
	}

	getMinMaxEndDate(mult: number) {
		if(this.items.length === 0) {
			return null;
		}

		let current = this.items[0];
		for(let i = 1; i < this.items.length; i++) {
			if(this.items[i].endDate.compare(current.endDate) * mult < 0) {
				current = this.items[i];
			}
		}
		return current;
	}

	getEarliestStartDate() {
		return this.getMinMaxStartDate(1);
	}

	getLatestEndDate() {
		return this.getMinMaxEndDate(-1);
	}

	mergeWithCalendar(other: Calendar) {
		const merged = new Calendar(`${this.name} & ${other.name}`);
		merged.items = this.items.concat(other.items);
		merged.isMerged = true;

		const mergedMap = new Map<string, CalendarEvent[]>(this.eventCache);
		other.eventCache.forEach((value, key) => {
			if(mergedMap.has(key)) {
				mergedMap.set(key, mergedMap.get(key)!.concat(value));
			} else {
				mergedMap.set(key, value);
			}
		});

		merged.eventCache = mergedMap;
		return merged;
	}

	splitCalendar() {
		const calendars: Calendar[] = [];

		for(let i = 0; i < this.items.length; i++) {
			const calendar = this.items[i].getCalendar();
			if(calendars.indexOf(calendar) === -1) {
				calendars.push(calendar);
			}
		}

		calendars.forEach((calendar) => {
			calendar.isMerged = false;
		});

		return calendars;
	}
}
