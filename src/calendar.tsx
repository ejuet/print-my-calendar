
import { parse, Component, Event, Time, Timezone, TimezoneService, Duration } from "ical.js"
import { testcontent } from './testics';
import { testcontent2 } from './testics2';
import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { Button, Table, Form, Container, DropdownButton, Accordion, Spinner } from "react-bootstrap";
import userEvent from "@testing-library/user-event";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import AccordionHeader from "react-bootstrap/esm/AccordionHeader";
import AccordionBody from "react-bootstrap/esm/AccordionBody";
import AccordionItem from "react-bootstrap/esm/AccordionItem";

import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'

const useUmlaute = true;
const defaultLanguage: string = "de-DE";
const nicerTrashcanNames = true;
const trashcanNameReplacements = {
	"Restabfallbehaelter": "Restmüll",
	"Gelbe Grossbehaelter": "Große Gelbe Tonne",
	"Gelbe Behaelter": "Gelbe Tonne",
	"Bioabfallbehaelter": "Grüne Tonne",
	"Papierbehaelter": "Blaue Tonne",
}

//TODO second format where each month is printed over 2 DinA4 pages
//TODO let users add images for each month
//TODO let users delete or even add items to calendars

export function exampleReadICS(textcontent) {
	let calendar = new Calendar("Aaaa");

	var data = parse(textcontent);
	console.log(data);

	var vcal = new Component(data);

	var defaultCalendarName = vcal.getFirstProperty("x-wr-calname")?.getFirstValue();
	if(!vcal.getFirstProperty("x-wr-calname")) {
		defaultCalendarName = "New Calendar"
	}
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
		//TODO warn that calendar data is only read for 15 years into future
		let iter = ev.iterator(ev.startDate)
		for(let next = iter.next(); next; next = iter.next()) {

			let calenderEv = new CalendarEvent(next, ev.duration, ev.summary);
			calendar.addEvent(calenderEv);

			if(calenderEv.startDate.toJSDate().getFullYear() > (new Date()).getFullYear() + 15) {
				break;
			}
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

const fonts = [
	"PleaseWriteMeASong",
	"monospace",
	'Arial',
	'Arial Black',
	'Bahnschrift',
	'Calibri',
	'Cambria',
	'Cambria Math',
	'Candara',
	'Comic Sans MS',
	'Consolas',
	'Constantia',
	'Corbel',
	'Courier New',
	'Ebrima',
	'Franklin Gothic Medium',
	'Gabriola',
	'Gadugi',
	'Georgia',
	'HoloLens MDL2 Assets',
	'Impact',
	'Ink Free',
	'Javanese Text',
	'Leelawadee UI',
	'Lucida Console',
	'Lucida Sans Unicode',
	'Malgun Gothic',
	'Marlett',
	'Microsoft Himalaya',
	'Microsoft JhengHei',
	'Microsoft New Tai Lue',
	'Microsoft PhagsPa',
	'Microsoft Sans Serif',
	'Microsoft Tai Le',
	'Microsoft YaHei',
	'Microsoft Yi Baiti',
	'MingLiU-ExtB',
	'Mongolian Baiti',
	'MS Gothic',
	'MV Boli',
	'Myanmar Text',
	'Nirmala UI',
	'Palatino Linotype',
	'Segoe MDL2 Assets',
	'Segoe Print',
	'Segoe Script',
	'Segoe UI',
	'Segoe UI Historic',
	'Segoe UI Emoji',
	'Segoe UI Symbol',
	'SimSun',
	'Sitka',
	'Sylfaen',
	'Symbol',
	'Tahoma',
	'Times New Roman',
	'Trebuchet MS',
	'Verdana',
	'Webdings',
	'Wingdings',
	'Yu Gothic',
];
export function CalendarList() {
	//TODO save all properties in cookie so nothing is lost on refresh

	const [calendars, setCalendars] = useState([
		//exampleReadICS(testcontent)
	]);

	const [startOfCalendar, setStart] = useState(new Time({
		year: (new Date()).getFullYear(),
		month: 1,
		day: 1
	}))
	const [endOfCalendar, setEnd] = useState(new Time({
		year: (new Date()).getFullYear(),
		month: 12,
		day: 31
	}))

	const [prevAmount, setPrevAmount] = useState(31);

	const [fontFamily, setFontFamily] = useState("PleaseWriteMeASong")

	const [fontSize, setFontSize] = useState(100);
	const [fontSizeHeading, setFontSizeHeading] = useState(100);
	const [calendarWidth, setCalendarWidth] = useState(100);

	return <>
		<h1 style={{ fontSize: "60px", marginTop: "5vh" }}>Print Your Calendar</h1>
		<p>Follow these steps to create your own Calendar:</p>
		<div style={{ marginLeft: "13vw", marginRight: "13vw", marginTop: "5vh", marginBottom: "5vh" }}>
			<Accordion>
				<AccordionItem eventKey="0">
					<AccordionHeader>Pick your Calendar Data</AccordionHeader>
					<AccordionBody>
						<p>
							Choose what events you want in your calendar.
						</p>
						<ul>
							<li>
								You can import events from Google Calendar or other digital calendars.
							</li>
							<li>
								You can use any data that is in a file that ends with <code>.ics</code>
							</li>
						</ul>

						<Accordion>
							<AccordionItem eventKey="0">
								<AccordionHeader>Import from Google Calendar</AccordionHeader>
								<AccordionBody>
									<ul>
										<li>Go to your Google Calendar. <a href="https://calendar.google.com/" target="_blank">Click here</a></li>
										<li>Click the Zahnradsymbol in the top right corner and then click <code>Settings</code>.</li>
										<li>Click <code>Importieren & Exportieren</code> and then click <code>Exportieren</code>.</li>
										<li>Put the Files in the next section.</li>
									</ul>
								</AccordionBody>
							</AccordionItem>
							<AccordionItem eventKey="1">
								<AccordionHeader>Import Müllabfuhrtermine Bonn</AccordionHeader>
								<AccordionBody>
									<ul>
										<li>Go to <a href="https://www.bonnorange.de/service/privatpersonen/abfuhrtermine/termine" target="_blank">BonnOrange</a> and fill in your information.</li>
										<li>Click <code>Leerungstermine in einer ical-Kalenderdatei</code> to download.</li>
										<li>Upload your files in the next section.</li>
									</ul>
								</AccordionBody>
							</AccordionItem>
						</Accordion>

						<p style={{ marginTop: 10 }}>Make sure all <code>.ics</code> files you need are on your device, then upload your files in the next section ("Upload Files").</p>
					</AccordionBody>
				</AccordionItem>

			</Accordion>
			<Accordion defaultActiveKey={"0"}>
				<Accordion.Item eventKey="0">
					<AccordionHeader>Import Your Files</AccordionHeader>
					<AccordionBody>
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
											setCalendars(oldCals => [...oldCals, exampleReadICS(fr.result)])
										};
										fr.readAsText(file);
									} else {
										window.alert("Please only upload .ics files");
									}
								}
							}}
						></input>
					</AccordionBody>
				</Accordion.Item>
			</Accordion>

			<Accordion>
				<AccordionItem eventKey="0">
					<AccordionHeader>
						Preview your Calendar
					</AccordionHeader>
					<AccordionBody>
						<p>Scroll to the bottom of the page to preview your calendar.</p>
						<p>Then, go to the next sections ("Rename and Reorder Columns" or "Calendar Settings") if you want to make any changes to your calendar.</p>
					</AccordionBody>
				</AccordionItem>
			</Accordion>

			<Accordion>
				<AccordionItem eventKey="0">
					<AccordionHeader>Rename and Reorder Columns</AccordionHeader>
					<AccordionBody>
						{
							calendars.map((cal, index) => {
								return <div key={index} className="d-flex justify-content-center" style={{ gap: 10, margin: 15 }}>
									<MyTextInput value={cal.name} onBlur={(e) => {
										const nCal = [...calendars];
										nCal[index].name = e.target.value;
										setCalendars(nCal)
									}} />
									<Button onClick={() => {
										const nCal = [...calendars].filter((cal, ind) => {
											return ind != index;
										})
										setCalendars(nCal)
									}}>Delete</Button>
									{
										calendars.filter((c) => { return c != cal }).length > 0 &&

										<DropdownButton title="Merge">
											{
												calendars.map((other, i) => {
													if(other != cal) {
														return <DropdownItem key={i} onClick={() => {
															var c = cal.mergeWithCalendar(other)
															setCalendars(oldCals => [...oldCals.filter((o) => { return o != other && o != cal }), c])
														}}>
															Merge with {other.name}
														</DropdownItem>
													}
												})
											}

										</DropdownButton>
									}

									{
										cal.getIsMerged() &&
										<Button onClick={() => {
											setCalendars(old => [...old.filter((o) => { return o != cal }), ...cal.splitCalendar()])
										}}>Split</Button>
									}

									{
										calendars.length > 1 &&
										<>
											<Button onClick={() => {
												setCalendars(old => swap([...old], index, index - 1))
											}}>Move Left</Button>
											<Button onClick={() => {
												setCalendars(old => swap([...old], index, index + 1))
											}}>Move Right</Button>
										</>
									}
									<MyNumberInput min={0} max={1} value={cal.width} onBlur={(e) => {
										const nCal = [...calendars];
										nCal[index].width = e.target.value;
										setCalendars(nCal)
									}} />

								</div>
							})
						}

						<Button onClick={() => {
							setCalendars(oldCalendars => [...oldCalendars, new Calendar("New Calendar")])
						}}>Add Empty Column</Button>
					</AccordionBody>
				</AccordionItem>
			</Accordion>

			<Accordion>
				<AccordionItem eventKey="0">
					<AccordionHeader>Calendar Settings</AccordionHeader>
					<AccordionBody>
						<h3>Start Date</h3>
						< DatePicker defaultYear={startOfCalendar.year} defaultMonth={startOfCalendar.month} defaultDay={startOfCalendar.day} onNewDate={(t: Time) => {
							setStart(t.clone());
						}} />

						<h3>End Date</h3>
						< DatePicker defaultYear={endOfCalendar.year} defaultMonth={endOfCalendar.month} defaultDay={endOfCalendar.day} onNewDate={(t: Time) => {
							setEnd(t.clone());
						}} />


						<h1>Display Settings</h1>

						<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
							<h2>Font Size (%):</h2>
							<MyNumberInput value={fontSize} onBlur={(e) => { setFontSize(e.target.value) }} min="0" max="" />
						</div>

						<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
							<h2>Font Size Heading (%):</h2>
							<MyNumberInput value={fontSizeHeading} onBlur={(e) => { setFontSizeHeading(e.target.value) }} min="0" max="" />
						</div>


						<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
							<h2>Width (%):</h2>
							<MyNumberInput value={calendarWidth} onBlur={(e) => { setCalendarWidth(e.target.value) }} min="1" max="" />
						</div>

						<div style={{ gap: 10, margin: 7, display: "none" }} >
							<h2>Amount of days to preview:</h2>
							<MyNumberInput value={prevAmount} onBlur={(e) => { setPrevAmount(e.target.value) }} min="" max="" />
						</div>


						<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
							<h2>Font:</h2>
							<Form.Select defaultValue={fontFamily} style={{ width: "20vw", fontFamily: fontFamily }} onChange={(e) => { setFontFamily(e.target.value) }}>
								{
									fonts.map((fontFam) => {
										return <option style={{ fontFamily: fontFam }} value={fontFam}>{fontFam}</option>
									})
								}
							</Form.Select>
						</div>

					</AccordionBody>
				</AccordionItem>
			</Accordion>

			<Accordion>
				<AccordionItem eventKey="0">
					<AccordionHeader>Generate a PDF File</AccordionHeader>
					<AccordionBody>
						<p>
							If you are happy with how your calendar looks, click the Button below to turn it into a PDF File. <br></br>
						</p>
					</AccordionBody>
				</AccordionItem>
			</Accordion>

			<Accordion>
				<AccordionItem eventKey="0">
					<AccordionHeader>Print your Calendar</AccordionHeader>
					<AccordionBody>
						<p>
							After clicking the "Save as PDF"-button, your calendar should be saved as a PDF document.
							<br></br>Open your "Downloads" folder and print it.
						</p>
					</AccordionBody>
				</AccordionItem>
			</Accordion>

		</div>

		{
			/*
				<h3>Calendar for year</h3>
				<Form.Control type="number" defaultValue={startOfCalendar.year} onBlur={(e)=>{
					let year = Number(e.target.value);
					setStart(new Time({year:year, month:1, day:1}))
					setEnd(new Time({year:year, month:12, day:31}))
				}} />
		*/
		}

		<h1>Result</h1>

		<DownloadButton startOfCalendar={startOfCalendar} endOfCalendar={endOfCalendar} />

		<Preview
			fontFamily={fontFamily}
			startOfCalendar={startOfCalendar}
			endOfCalendar={endOfCalendar}
			calendars={calendars}
			previewAmount={prevAmount}
			fontSize={fontSize}
			fontSizeHeading={fontSizeHeading}
			calendarWidth={calendarWidth}
		/>
	</>

}

function DownloadButton({ startOfCalendar, endOfCalendar }) {
	const [downloading, setDownloading] = useState(false);

	return <>
		<Button onClick={() => {
			/*
			MonthMap.map(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear: string, days: Time[]) => {
				downloadHTMLElementWithID(monthAndYear);
			});
			*/
			setDownloading(true);
			downloadAsPDF(startOfCalendar, endOfCalendar).then(() => {
				setDownloading(false)
			})
		}}>Save as PDF</Button>
		{
			downloading &&
			<div style={{ marginTop: 5 }}>
				<Spinner></Spinner>
				<p>Creating PDF...</p>
			</div>
		}
	</>;
}

/*
function Result(props) {
	return <>
		<Preview {...props} />
		<Render {...props} />
	</>

}
*/

export function Credits() {
	return <div className="">
		<h1>Info & Credits</h1>
		<h2>ICal.js</h2>
		<p>Used for parsing calendar data</p>
		<h2>HTML2Canvas</h2>
		<p>Used for rendering the calendar as a canvas element to be able to turn it into a PDF.</p>
		<h2>pdf-lib</h2>
		<p>Used for creating the PDF File.</p>
		<h2>Font "Please Write Me A Song"</h2>
		<p style={{ fontFamily: "PleaseWriteMeASong" }}>Created by Vanessa Bays @ http://bythebutterfly.com</p>
		<h2>Other</h2>
		<p>This Website was created with React using Bootstrap and is hosted on Github Pages.</p>
	</div>
}

function swap(arr, a: number, b: number) {

	if(a < 0 || a >= arr.length || b < 0 || b >= arr.length) {
		return arr;
	}

	var temp = arr[a];
	arr[a] = arr[b];
	arr[b] = temp;
	return arr;
}

function MyTextInput({ value, onBlur }) {
	return <MyInputField value={value} onBlur={onBlur} type="text" min="" max="" style={{ width: "40%" }} />
}

function MyNumberInput({ value, onBlur, min, max }) {
	return <MyInputField value={value} onBlur={onBlur} type="number" min={min} max={max} style={{ width: "20%" }} />
}

function MyInputField({ value, onBlur, min, max, type, style }) {
	const [val, setVal] = useState(value);

	useEffect(() => {
		setVal(value);
	}, [value])

	return <Form.Control as={"input"} min={min} max={max} type={type} style={style} value={val} onChange={(e) => {
		setVal(e.target.value)
	}}
		onBlur={onBlur}></Form.Control>
}

function DatePicker({ onNewDate, defaultYear, defaultMonth, defaultDay }) {
	const [year, setYear] = useState(defaultYear);
	const [day, setDay] = useState(defaultDay);
	const [month, setMonth] = useState(defaultMonth);

	useEffect(() => {
		pushDate()
	}, [year, month, day])

	return <Container>
		<div className="d-flex  justify-content-center" style={{ gap: 10, margin: 15 }}>
			<Form.Control onBlur={(e) => { setYear(parseInt(e.target.value)) }} type="number" defaultValue={year}></Form.Control>
			<Form.Select defaultValue={month} onChange={(e) => { setMonth(parseInt(e.target.value)) }}>
				{
					Array(12).fill("i").map((el, i) => {
						return <option key={i} value={i + 1}>{Language.getMonthNameByNumber(i)}</option>
					})
				}
			</Form.Select>
			<Form.Control onBlur={(e) => { setDay(parseInt(e.target.value)); }} type="number" defaultValue={day}></Form.Control>
		</div>
	</Container>

	function pushDate() {
		const t = new Time({ year: year, month: month, day: day });
		onNewDate(t);
	}
}

class CalendarEvent {
	startDate: any;
	summary: string;
	duration: any;
	durationInSeconds: number;
	endDate: any;
	private istrash: boolean;
	private belongsToCalendars: Calendar;
	constructor(startDate: any, duration: any, summary: string) {
		this.startDate = startDate;
		this.durationInSeconds = duration.toSeconds();
		this.summary = summary.trim();
		this.endDate = startDate.clone();
		this.endDate.addDuration(duration);

		this.istrash = false;
		for(let i = 0; i < Object.keys(trashcanNameReplacements).length; i++) {
			if(this.summary === Object.keys(trashcanNameReplacements)[i]) {
				this.istrash = true;
			}
		}
	}

	addedToCalendar(cal: Calendar) {
		this.belongsToCalendars = cal;
	}
	getCalendar() {
		return this.belongsToCalendars;
	}

	private getPrettierSummary() {
		var s = this.summary;
		if(nicerTrashcanNames) {
			Object.keys(trashcanNameReplacements).forEach((key) => {
				s = s.replaceAll(key, trashcanNameReplacements[key]);
			});
		}
		if(useUmlaute) {
			s = s.replaceAll("ae", "ä");
		}
		return s;
	}

	isTrash() {
		return this.istrash;
	}

	isToday(date: Time) {
		var utcTimezone = Timezone.utcTimezone;
		return (
			date.compareDateOnlyTz(this.startDate, utcTimezone) >= 0 && date.compareDateOnlyTz(this.endDate, utcTimezone) <= 0
			&& (this.isFullDayEvent() ? date.compareDateOnlyTz(this.endDate, utcTimezone) < 0 : true)
		)
	}

	isFullDayEvent() {
		let s = this.startDate.toJSDate();
		let e = this.endDate.toJSDate();

		return (
			Math.abs((this.startDate.toJSDate().valueOf() - this.endDate.toJSDate().valueOf()) / (1000 * 60 * 60 * 24)) == 1 &&
			s.getHours() == 0 && e.getHours() == 0 && s.getMinutes() == 0 && e.getMinutes() == 0
		)
	}

	isMultipleDaysLong() {
		return (
			//event is more than one day long
			this.startDate.compareDateOnlyTz(this.endDate, Timezone.localTimezone) < 0

			//Event is not exactly 1 day long:
			&& !this.isFullDayEvent()

		)
	}

	isBeginningDate(date: Time) {
		return this.isMultipleDaysLong() && (this.startDate.compareDateOnlyTz(date, Timezone.localTimezone) == 0);
	}

	isEndDate(date: Time) {
		return this.isMultipleDaysLong() && (this.endDate.compareDateOnlyTz(date, Timezone.localTimezone) == 0);
	}

	getFullSummary() {
		const startTime = this.startDate.hour != 0 || this.startDate.minute != 0 || this.startDate.second != 0 ?
			this.startDate.toJSDate().toLocaleTimeString(defaultLanguage) : "";

		const endTime = this.endDate.hour != 0 || this.endDate.minute != 0 || this.endDate.second != 0 ?
			this.endDate.toJSDate().toLocaleTimeString(defaultLanguage) : "";

		var zeit = "";

		if(startTime != "" && endTime == "") {
			zeit = "ab " + startTime;
		}
		else if(startTime == "" && endTime != "") {
			zeit = "bis " + endTime
		}
		else if(startTime != "" && endTime != "") {
			zeit = startTime + " bis " + endTime
		}

		if(zeit != "") {
			zeit = " (" + zeit + ")"
		}
		/*
			const zeit = startTime != "" || endTime != "" ?
			" (" + startTime + " " + endTime + ")" : "";
			*/

		return this.getPrettierSummary() + zeit;
	}

}

class Calendar {
	items: CalendarEvent[]
	name: string
	private isMerged: boolean
	width: number


	eventCache: Map<string, CalendarEvent[]>; // Map to cache events by date

	constructor(name: string) {
		this.items = [];
		this.name = name;
		this.isMerged = false;
		this.width = 1;

		this.eventCache = new Map(); // Initialize the event cache
	}

	addEvent(ev: CalendarEvent) {
		ev.addedToCalendar(this);
		this.items.push(ev);

		//add repeated events to event cache map
		if(ev.isMultipleDaysLong()) {

			//Beginning of event
			var cl = Object.create(ev);
			cl.summary = "Beginn von " + cl.getPrettierSummary();
			cl.endDate = new Time();
			this.addToEventMap(ev.startDate.toJSDate(), cl);

			//End of event
			cl = Object.create(ev);
			cl.summary = "Ende von " + cl.getPrettierSummary();
			cl.startDate = new Time();

			//if event ends on 00:00, set the end day to the day before to display it correctly
			var e = ev.endDate.toJSDate();
			if(e.getHours() == 0 && e.getMinutes() == 0) {
				e.setDate(e.getDate() - 1)
			}
			this.addToEventMap(e, cl);

		}
		else {
			this.addToEventMap(ev.startDate.toJSDate(), ev);
		}


	}

	addToEventMap(date: Date, ev: CalendarEvent) {
		const dateKey = date.toDateString()
		if(!this.eventCache.has(dateKey)) {
			this.eventCache.set(dateKey, []);
		}
		this.eventCache.get(dateKey)!.push(ev);
	}

	getIsMerged() {
		return this.isMerged;
	}

	getEvents(date: Time) {
		var todayy = this.eventCache.get(date.toJSDate().toDateString())
		return todayy ? todayy : []
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

	mergeWithCalendar(other: Calendar) {
		var c = new Calendar(this.name + " & " + other.name);
		c.items = this.items.concat(other.items);
		c.isMerged = true;

		const mergedMap = new Map<string, CalendarEvent[]>(this.eventCache);

		other.eventCache.forEach((value, key) => {
			if (mergedMap.has(key)) {
				// If a conflict arises (key already exists), you may want to merge or overwrite the values
				// For simplicity, this example just overwrites the values
				mergedMap.set(key, mergedMap.get(key)!.concat(value))
			} else {
				// If the key doesn't exist in the destination map, simply add the key-value pair
				mergedMap.set(key, value);
			}
		});

		c.eventCache = mergedMap;

		return c;
	}

	splitCalendar() {
		var nCals: Calendar[];
		nCals = [];
		for(let i = 0; i < this.items.length; i++) {
			var e = this.items[i];

			var c = e.getCalendar();
			if(nCals.indexOf(c) == -1) {
				nCals.push(c);
			}
		}
		c.isMerged = false;
		return nCals;
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

function Preview(props) {
	return <CalendarPreview
		size={0.1}
		preview={true}
		{...props}
	/>
}

/*
function Render(props) {
	return <div id="renderedResult" style={{ display: "none" }}>
		<CalendarPreview
			size={2.15}
			preview={false}
			{...props}
		/>
	</div>
}
*/

function CalendarPreview({ startOfCalendar, endOfCalendar, calendars, size, preview, previewAmount = 2,
	fontFamily = "PleaseWriteMeASong", lineHeight = 400, calendarWidth = 100,
	fontSize = 400, fontSizeHeading = 100
}) {
	const pageWidth = size * 4000 * (calendarWidth / 100) // in px



	return MonthMap.map(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear: string, days: Time[]) => {
		return <div style={{ width: pageWidth + "px", margin: "auto" }} key={monthAndYear} className={"calendar " + monthAndYear} id={monthAndYear}>
			<p style={{ fontFamily: fontFamily, fontSize: (lineHeight / 100) * 120 * 0.65 * size * (fontSizeHeading / 100)+"px", marginTop: size * 0.05 + "em", marginBottom: size * 0.07 + "em", contentVisibility: "visible !important" }} className="monthname">{Language.getMonthName(monthAndYear)}</p>
			<Table bordered style={{
				fontSize: 1.8 * size + "em",
				verticalAlign: "middle",
				padding: "0 px !important",
				fontFamily: fontFamily,
			}}>
				<thead>
					<tr style={{ fontSize: (lineHeight / 100) * 40 * 0.65 * size * (fontSizeHeading / 100) }}>
						<th style={{ width: "10%", verticalAlign: "middle" }}>Day</th>
						{calendars.map((cal: Calendar, i: number) => {
							return <th key={i} style={{
								verticalAlign: "middle",
								width: (90 / calendars.length) * cal.width + "%",
								height: (lineHeight / 100) * 55 * size + "px"
								, fontSize: (lineHeight / 100) * 55 * 0.65 * size * (fontSizeHeading / 100) + "px" //use maximum font size that fits into row if there is only one line
							}}>{cal.name}</th>;
						})}
					</tr>
				</thead>
				<tbody>
					{days.map((day: Time, index: number) => {
						if(preview) {
							if(index == previewAmount) {
								return <tr><td>...</td></tr>
							}
							if(index > previewAmount) {
								return;
							}
						}
						var tdstyle = {
							backgroundColor: day.toJSDate().getDay()==6||day.toJSDate().getDay()==0 ? "#b8b8b8" : (day.toJSDate().getDay() % 2 == 0 ? "#dedede" : "white"),
							height: (lineHeight / 100) * 40 * size + "px",
							//fontSize: 0.9 * (fontSize / 100) + "em"
							fontSize: (lineHeight / 100) * 40 * 0.65 * size * (fontSize / 100) + "px" //use maximum font size that fits into row if there is only one line
						}
						return <tr key={day.toString()} >
							<td className="day" style={tdstyle}>
								<b style={{ 
									fontSize:(lineHeight / 100) * 33 * 0.65 * size * (fontSize / 100) + "px"
									}}>
									{Language.getWeekdayName(day).slice(0, 2) + " " + day.day.toString()}
								</b>
							</td>
							{calendars.map((cal: Calendar, i: number) => {
								const content = cal.getEvents(day).map((ev: CalendarEvent) => {
									return ev.getFullSummary();
								}).join(", ")

								const fieldWidth = pageWidth*((90 / calendars.length) * cal.width)/100

								const charsPerLineWidth = (32/183.15) //measured values

								const charsPerLine = charsPerLineWidth*fieldWidth;

								const lines = Math.ceil(content.length/charsPerLine);

								return <td key={i} style={{...tdstyle,
									fontSize: (lineHeight / 100) * 40 * 0.65 * size * (fontSize / 100) * (1/lines) + "px"
								}}>
									{
										content 
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

async function createPdf(urls, filename) {
	const pdfDoc = await PDFDocument.create()

	for(const url of urls) {

		// Load the image
		const imageBytes = await fetch(url).then(response => response.arrayBuffer());
		const image = await pdfDoc.embedJpg(imageBytes);

		// Add a new page for each image
		const page = pdfDoc.addPage(PageSizes.A4);

		//TODO hiermit auf DinA4 festgelegt, aber dumm wenn nicht vollständige seite zb nur paar zeilen
		const { width, height } = page.getSize();
		const fac = 0.95;
		const imageSize = { width: width * fac, height: height * fac }; // Adjust image size as needed

		// Calculate image position
		const x = (width - imageSize.width) / 2;
		const y = (height - imageSize.height) / 2;

		// Draw the image onto the page
		page.drawImage(image, {
			x,
			y,
			width: imageSize.width,
			height: imageSize.height,
		});
	}

	const pdfBytes = await pdfDoc.save()

	// Convert bytes to a blob
	const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

	// Create download link
	const downloadLink = document.createElement('a');
	downloadLink.href = URL.createObjectURL(pdfBlob);
	downloadLink.download = filename + '.pdf';
	downloadLink.click();
}

function downloadAsPDF(startOfCalendar, endOfCalendar) {
	var promises = [];
	MonthMap.map(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear: string, days: Time[]) => {
		promises.push(getDownloadLink(monthAndYear))
	});

	return Promise.all(promises).then(links => {
		const urls = links.map((link) => link.href)
		createPdf(urls, "Calendar-" + startOfCalendar + "-" + endOfCalendar)
	})
}


function downloadHTMLElementWithID(monthAndYear: string, parentID: string = "") {
	getDownloadLink(monthAndYear).then(() => link.click())
}

//TODO monthAndYear was initially taken from classname and not id, check if classname is important anywhere else and if not remove it from classname
function getDownloadLink(monthAndYear: string) {
	return new Promise((resolve, reject) => {
		var els = document.getElementById(monthAndYear);
		html2canvas(els, { scrollX: -window.scrollX, scale: 6 }).then(canvas => {
			var link = document.createElement('a');
			link.download = monthAndYear + '.jpg';
			link.href = canvas.toDataURL("image/jpeg", 0.9);
			console.log(link.href);
			resolve(link); // Resolve the promise with the link
		}).catch(error => {
			reject(error); // Reject the promise if there's an error
		});
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
		const month = monthAndYear.split("-")[0] as unknown as number - 1;
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
		return Language.getWeekdayNameByLanguage(time, defaultLanguage)
	}
}