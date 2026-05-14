import { Duration, Time } from "ical.js";
import { defaultLanguage } from "./constants";

export type CalendarDay = Time & {
	monthAndYear: string;
};

export type MonthMap = Record<string, CalendarDay[]>;

export function getDaysBetween(start: Time, end: Time): CalendarDay[] {
	const current = start.clone();
	const result: CalendarDay[] = [];

	while(current.compare(end) <= 0) {
		const day = clampToDay(current) as CalendarDay;
		day.monthAndYear = `${day.month}-${day.year}`;
		result.push(day);
		current.addDuration(Duration.fromData({ days: 1 }));
	}

	return result;
}

export function getDaysInMonths(start: Time, end: Time): MonthMap {
	return groupBy(getDaysBetween(start, end), "monthAndYear");
}

export function clampToDay(time: Time) {
	return Time.fromData({ year: time.year, month: time.month, day: time.day }, time.timezone);
}

export function mapMonthMap<T>(monthMap: MonthMap, mapper: (monthAndYear: string, days: CalendarDay[]) => T): T[] {
	return Object.keys(monthMap).map((month) => mapper(month, monthMap[month]));
}

export class Language {
	static getMonthNameByLanguage(monthAndYear: string, language: string) {
		const month = Number(monthAndYear.split("-")[0]) - 1;
		return Language.getMonthNameByNumberByLanguage(language, month);
	}

	static getMonthNameByNumberByLanguage(language: string, month: number) {
		const options = { month: "long" } as const;
		return new Intl.DateTimeFormat(language, options).format(new Date(2000, month, 1));
	}

	static getMonthNameByNumber(month: number) {
		const options = { month: "long" } as const;
		return new Intl.DateTimeFormat(defaultLanguage, options).format(new Date(2000, month, 1));
	}

	static getMonthName(monthAndYear: string) {
		return Language.getMonthNameByLanguage(monthAndYear, defaultLanguage);
	}

	static getWeekdayNameByLanguage(time: Time, language: string) {
		const options = { weekday: "long" } as const;
		return new Intl.DateTimeFormat(language, options).format(time.toJSDate());
	}

	static getWeekdayName(time: Time) {
		return Language.getWeekdayNameByLanguage(time, defaultLanguage);
	}
}

function groupBy<T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T[]> {
	return arr.reduce((result, item) => {
		const groupKey = String(item[key]);
		(result[groupKey] = result[groupKey] || []).push(item);
		return result;
	}, {} as Record<string, T[]>);
}
