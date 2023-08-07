
import { parse, Component, Event, Time, Timezone, TimezoneService, Duration } from "ical.js"
import { testcontent } from './testics';
import { testcontent2 } from './testics2';
import React, { useState } from "react";
import html2canvas from "html2canvas";
import { Button, Table, Form } from "react-bootstrap";

const useUmlaute = true;
const defaultLanguage: string = "de-DE";
const nicerTrashcanNames = true;
const trashcanNameReplacements = {
	"Restabfallbehälter": "Restmüll",
	"Gelbe Grossbehälter": "Große Gelbe Tonne",
	"Gelbe Behälter": "Gelbe Tonne",
	"Bioabfallbehälter ": "Grüne Tonne",
	"Papierbehälter": "Blaue Tonne",
}

export function exampleReadICS(textcontent) {
	let calendar = new Calendar("Aaaa");

	var data = parse(textcontent);
	console.log(data);

	var vcal = new Component(data);

	var defaultCalendarName = vcal.getFirstProperty("x-wr-calname").getFirstValue();
	calendar.name = defaultCalendarName;

	var events = vcal.getAllSubcomponents("vevent");
	for(let j = 0; j < events.length; j++) {
		var ev = new Event(events[j]);
		/*
		console.log(ev.summary);
		console.log(ev.duration.toSeconds());
		console.log(ev.isRecurring());
		*/

		//iterate over dates of event
		//TODO stop iteration when recurring is infinite => only for a few years or so
		let iter = ev.iterator(ev.startDate)
		for(let next = iter.next(); next; next = iter.next()) {

			let calenderEv = new CalendarEvent(next, ev.duration, ev.summary);
			calendar.addEvent(calenderEv);
			//console.log(calenderEv)
		}

	}

	console.log(calendar);
	return calendar;
}

export function ListEvents() {
	return <>
		<div id="capture">
			<ExampleEventList />
		</div>
		<Button onClick={() => {
			html2canvas(document.querySelector("#capture")!).then(canvas => {
				var link = document.createElement('a');
				link.download = 'calendar.png';
				link.href = canvas.toDataURL()
				link.click();
			});

		}}>
			Download
		</Button>
	</>
}

function ExampleEventList() {
	const cal = exampleReadICS(testcontent2);
	const timezone = Timezone.fromData({
		tzid: "(GMT +02:00)"
	});
	const today = Time.fromJSDate(new Date(), false);
	return <>
		<div>
			<p>Today: {JSON.stringify(today)}</p>
			<p>Timezone: {timezone.toString()}</p>
			<p>Earliest: {cal.getEarliestStartDate()?.startDate.toString()}</p>
			<p>Last: {cal.getLatestEndDate()?.endDate.toString()}</p>
			{
				cal.getAllEvents().map((e) => {
					return <div key={e.startDate.toString() + e.summary}>
						<h2>{e.summary}</h2>
						<p>{e.startDate.toString()} bis {e.endDate.toString()}</p>
						{
							e.isToday(today) &&
							<b>Today</b>
						}
					</div>
				})
			}
		</div>

	</>

	function getD() {
		var today = Time.fromJSDate(new Date(), false);
		today = today.convertToZone(timezone);
		//today = today.convertToZone(Timezone.utcTimezone);
		return Timezone.convert_time(today, timezone, Timezone.utcTimezone);
	}
}

export function CalendarList() {
	const [calendars, setCalendars] = useState([exampleReadICS(testcontent), exampleReadICS(testcontent2)]);

	const startOfCalendar = new Time({
		year: 2023,
		month: 8,
		day: 1
	})
	const endOfCalendar = new Time({
		year: 2023,
		month: 12,
		day: 31
	})

	return <>
		<h1>Upload Files</h1>
		<input
			type="file"
			accept="ics"
			multiple
			onChange={(e) => {
				var files = e.target.files!;
				for(let i = 0; i < files.length; i++) {
					const file = files[i];
					if(file.name.endsWith(".ics")) {
						let fr = new FileReader();
						fr.onload = function () {
							console.log(fr.result);
							console.log(typeof fr.result);

							/*
							const nCal = [...calendars];
							nCal.push(exampleReadICS(fr.result));
							setCalendars(nCal)
							*/
							setCalendars(oldCals=>[...oldCals, exampleReadICS(fr.result)])
						};
						fr.readAsText(file);
					} else {
						window.alert("Please only upload .ics files");
					}
				}
			}}
		></input>

		{
			calendars.map((cal, index)=>{
				return <div >
					<input style={{width:"40%"}} defaultValue={cal.name} onBlur={(e)=>{
						const nCal = [...calendars];
						nCal[index].name=e.target.value;
						setCalendars(nCal)
					}}></input>
					<Button onClick={()=>{
						const nCal = [...calendars].filter((cal, ind)=>{
							return ind!=index;
						})
						setCalendars(nCal)
					}}>X</Button>
				</div>
			})
		}

		<h1>Result</h1>
		<Button onClick={() => {
			MonthMap.map(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear: string, days: Time[]) => {
				downloadHTMLElementWithID(monthAndYear);
			})
		}}>Download</Button>
		<CalendarPreview startOfCalendar={startOfCalendar} endOfCalendar={endOfCalendar} calendars={calendars}/>
	</>

}

class CalendarEvent {
	startDate: any;
	summary: string;
	duration: any;
	durationInSeconds: number;
	endDate: any;
	constructor(startDate: any, duration: any, summary: string) {
		this.startDate = startDate;
		this.durationInSeconds = duration.toSeconds();
		this.summary = summary.trim();
		this.endDate = startDate.clone();
		this.endDate.addDuration(duration);
		this.prettierSummary();
	}

	private prettierSummary() {
		if(useUmlaute) {
			this.summary = this.summary.replaceAll("ae", "ä");
		}
		if(nicerTrashcanNames) {
			Object.keys(trashcanNameReplacements).forEach((key) => {
				this.summary = this.summary.replaceAll(key, trashcanNameReplacements[key]);
			});
		}
	}

	isToday(date: Time) {
		var utcTimezone = Timezone.utcTimezone;
		return date.compareDateOnlyTz(this.startDate, utcTimezone) >= 0 && date.compareDateOnlyTz(this.endDate, utcTimezone) <= 0
	}

	getFullSummary(){
		const startTime = this.startDate.hour!=0 || this.startDate.minute!=0 || this.startDate.second!=0 ? 
		this.startDate.toJSDate().toLocaleTimeString(defaultLanguage) : "";

		const endTime = this.endDate.hour!=0 || this.endDate.minute!=0 || this.endDate.second!=0 ? 
		"bis "+this.endDate.toJSDate().toLocaleTimeString(defaultLanguage) : "";

		const zeit = startTime!="" && endTime!="" ? 
		" ("+startTime+" "+endTime+")" : "";

		return this.summary+zeit;
	}

}

class Calendar {
	items: CalendarEvent[]
	name: string
	constructor(name: string) {
		this.items = [];
		this.name = name;
	}

	addEvent(ev: CalendarEvent) {
		this.items.push(ev);
	}

	getEvents(date: Time) {
		var today: CalendarEvent[];
		today = []
		for(let i = 0; i < this.items.length; i++) {
			if(this.items[i].isToday(date)) {
				today.push(this.items[i]);
			}
		}
		return today;
	}

	getAllEvents() {
		return this.items;
	}

	getMinMaxStartDate(mult: number) { //mult=1 => min
		if(this.items.length == 0) {
			return null;
		}
		let earliest = this.items[0];
		for(let i = 1; i < this.items.length; i++) {
			if(this.items[i].startDate.compare(earliest.startDate) * mult < 0) {
				earliest = this.items[i];
			}
		}
		return earliest;
	}

	getMinMaxEndDate(mult: number) { //mult=1 => min
		if(this.items.length == 0) {
			return null;
		}
		let earliest = this.items[0];
		for(let i = 1; i < this.items.length; i++) {
			if(this.items[i].endDate.compare(earliest.endDate) * mult < 0) {
				earliest = this.items[i];
			}
		}
		return earliest;
	}

	getEarliestStartDate() {
		return this.getMinMaxStartDate(1);
	}
	getLatestEndDate() {
		return this.getMinMaxEndDate(-1);
	}

	/*
	getDays() {
		return getDaysBetween(this.getEarliestStartDate()?.startDate, this.getLatestEndDate()?.endDate)
	}

	getDaysInMonths(): MonthMap {
		return (groupBy(this.getDays(), "monthAndYear")) as MonthMap
	}
	*/

}


function CalendarPreview({startOfCalendar, endOfCalendar, calendars}) {
	return MonthMap.map(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear: string, days: Time[]) => {
		return <div style={{ width: "1100px" }} key={monthAndYear} id={monthAndYear}>
			<h2>{Language.getMonthName(monthAndYear)}</h2>
			<Table bordered>
				<thead>
					<tr>
						<th style={{ width: "10%" }}>Day</th>
						{calendars.map((cal: Calendar) => {
							return <th style={{ width: 90 / calendars.length + "%" }}>{cal.name}</th>;
						})}
					</tr>
				</thead>
				<tbody>
					{days.map((day: Time) => {
						var tdstyle={backgroundColor: day.day%2==1?"#dedede":"white"}
						return <tr key={day.toString()}>
							<td style={tdstyle}>{day.day.toString() + "\n" + Language.getWeekdayName(day).slice(0, 2)}</td>
							{calendars.map((cal: Calendar) => {
								return <td style={tdstyle}>
									{cal.getEvents(day).map((ev: CalendarEvent) => {
										return ev.getFullSummary();
									}).join(", ")
								}
								</td>;
							})}
						</tr>;
					})}
				</tbody>

			</Table>
		</div>;
	});
}

function downloadHTMLElementWithID(monthAndYear: string) {
	html2canvas(document.getElementById(monthAndYear)!).then(canvas => {
		var link = document.createElement('a');
		link.download = 'calendar.png';
		link.href = canvas.toDataURL();
		link.click();
	});
}

function getDaysBetween(start: Time, end: Time) {
	var c = start.clone();
	var ret: Time[];
	ret = [];
	while(c.compare(end) <= 0) {
		var n = clampToDay(c);
		n.monthAndYear = n.month + "-" + n.year;
		ret.push(n);
		c.addDuration(Duration.fromData({ days: 1 }));
	}
	return ret;
}

function getDaysInMonths(start: Time, end: Time): MonthMap {
	return (groupBy(getDaysBetween(start, end), "monthAndYear")) as MonthMap
}

function clampToDay(c: Time) {
	return Time.fromData({ year: c.year, month: c.month, day: c.day }, c.timezone);
}


class MonthMap {

	static map(th: MonthMap, f: any) {
		return Object.keys(th).map((month) => {
			return f(month, th[month]);
		})
	}



}

function groupBy(arr, key) {
	return arr.reduce(function (rv, x) {
		(rv[x[key]] = rv[x[key]] || []).push(x);
		return rv;
	}, {});
};

class Language {

	static getMonthNameByLanguage(monthAndYear: string, language: string) {
		const options = { month: "long" } as const;
		const month = monthAndYear.split("-")[0] as unknown as number - 1;
		const year = monthAndYear.split("-")[1] as unknown as number;
		return new Intl.DateTimeFormat(language, options).format(new Date(year, month, 1));
	}

	static getMonthName(monthAndYear: string) {
		return Language.getMonthNameByLanguage(monthAndYear, defaultLanguage);
	}

	static getWeekdayNameByLanguage(time: Time, language: string) {
		const options = { weekday: "long" } as const;
		return new Intl.DateTimeFormat(language, options).format(time.toJSDate());
	}
	static getWeekdayName(time: Time) {
		return Language.getWeekdayNameByLanguage(time, defaultLanguage)
	}
}