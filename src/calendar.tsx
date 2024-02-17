
import { parse, Component, Event, Time, Timezone, TimezoneService, Duration } from "ical.js"
import { testcontent } from './testics';
import { testcontent2 } from './testics2';
import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { Button, Table, Form, Container, DropdownButton, Accordion } from "react-bootstrap";
import userEvent from "@testing-library/user-event";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import AccordionHeader from "react-bootstrap/esm/AccordionHeader";
import AccordionBody from "react-bootstrap/esm/AccordionBody";
import AccordionItem from "react-bootstrap/esm/AccordionItem";

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
	const [calendars, setCalendars] = useState([
		//exampleReadICS(testcontent)
		new Calendar("Column")
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
										<li>Upload the Files in the next section.</li>
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
			<Accordion>
				<Accordion.Item eventKey="0">
					<AccordionHeader>Upload Files</AccordionHeader>
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
				<AccordionItem>
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

						<div style={{ gap: 10, margin: 7, display: "none" }} >
							<h2>Amount of days to preview:</h2>
							<MyNumberInput value={prevAmount} onBlur={(e) => { setPrevAmount(e.target.value) }} min="" max="" />
						</div>


						<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
							<h2>Font:</h2>
							<Form.Select style={{ width: "20vw", fontFamily: fontFamily }} onChange={(e) => { setFontFamily(e.target.value) }}>
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
					<AccordionHeader>Download your Calendar</AccordionHeader>
					<AccordionBody>
						<p>
							If you are happy with how your calendar looks, click this button to download it. <br></br>
						</p>
						<DownloadButton startOfCalendar={startOfCalendar} endOfCalendar={endOfCalendar} />
					</AccordionBody>
				</AccordionItem>
			</Accordion>

			<Accordion>
				<AccordionItem eventKey="0">
					<AccordionHeader>Print your Calendar</AccordionHeader>
					<AccordionBody>
						<p>
							After clicking the download button, your calendar should be downloaded as individual images.
							<br></br>Open your "Downloads" folder and print them as you like.
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
		/>
	</>

}

function DownloadButton({ startOfCalendar, endOfCalendar }) {
	return <Button onClick={() => {
		MonthMap.map(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear: string, days: Time[]) => {
			downloadHTMLElementWithID(monthAndYear);
		});
	}}>Download</Button>;
}

function Result(props) {
	return <>
		<Preview {...props} />
		<Render {...props} />
	</>

}

export function Credits() {
	return <div className="">
		<h1>Info & Credits</h1>
		<h2>ICal.js</h2>
		<p>Used for parsing calendar data</p>
		<h2>HTML2Canvas</h2>
		<p>Used for rendering the calendar as a canvas element to be able to download it.</p>
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
			Math.abs(this.startDate.compareDateOnlyTz(this.endDate, Timezone.localTimezone)) == 1 &&
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
	constructor(name: string) {
		this.items = [];
		this.name = name;
		this.isMerged = false;
		this.width = 1;
	}

	addEvent(ev: CalendarEvent) {
		ev.addedToCalendar(this);
		this.items.push(ev);
	}

	getIsMerged() {
		return this.isMerged;
	}

	getEvents(date: Time) {
		var today: CalendarEvent[];
		today = []
		for(let i = 0; i < this.items.length; i++) {
			var e = this.items[i];
			if(e.isMultipleDaysLong() && !e.isTrash()) {
				if(e.isBeginningDate(date)) {
					var cl = Object.create(e);
					cl.summary = "Beginn von " + cl.getPrettierSummary();
					cl.endDate = new Time();
					today.push(cl)
				}
				else if(e.isEndDate(date)) {
					var cl = Object.create(e);
					cl.summary = "Ende von " + cl.getPrettierSummary();
					cl.startDate = new Time();
					today.push(cl)
				}
			}
			else {
				if(e.isToday(date)) {
					today.push(this.items[i]);

				}
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

	mergeWithCalendar(other: Calendar) {
		var c = new Calendar(this.name + " & " + other.name);
		c.items = this.items.concat(other.items);
		c.isMerged = true;
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
		size={0.8}
		preview={true}
		{...props}
	/>
}

function Render(props) {
	return <div id="renderedResult" style={{ display: "none" }}>
		<CalendarPreview
			size={2.15}
			preview={false}
			{...props}
		/>
	</div>
}


function CalendarPreview({ startOfCalendar, endOfCalendar, calendars, size, preview, previewAmount = 2,
	fontFamily = "PleaseWriteMeASong", lineHeight = 220, calendarWidth = 100,
	fontSize = 100, fontSizeHeading = 100
}) {

	return MonthMap.map(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear: string, days: Time[]) => {
		return <div style={{ width: size * 1100 * (calendarWidth / 100) + "px", margin: "auto" }} key={monthAndYear} className={"calendar " + monthAndYear}>
			<p style={{ fontFamily: fontFamily, fontSize: size * 6 * (calendarWidth / 100) + "em", marginTop: size * 0.05 + "em", marginBottom: size * 0.07 + "em", contentVisibility: "visible !important" }} className="monthname">{Language.getMonthName(monthAndYear)}</p>
			<Table bordered style={{
				fontSize: 1.8 * size + "em",
				verticalAlign: "middle",
				padding: "0 px !important",
				fontFamily: fontFamily,
			}}>
				<thead>
					<tr style={{ fontSize: 1.2 * (fontSizeHeading / 100) + "em" }}>
						<th style={{ width: "10%", verticalAlign: "middle" }}>Day</th>
						{calendars.map((cal: Calendar, i: number) => {
							return <th key={i} style={{
								verticalAlign: "middle",
								width: (90 / calendars.length) * cal.width + "%",
								height: (lineHeight / 100) * 55 * size + "px"
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
							backgroundColor: day.day % 2 == 1 ? "#dedede" : "white",
							height: (lineHeight / 100) * 40 * size + "px"
						}
						return <tr key={day.toString()}>
							<td className="day" style={{ ...tdstyle }}><b>
								{Language.getWeekdayName(day).slice(0, 2) + " " + day.day.toString()}
							</b></td>
							{calendars.map((cal: Calendar, i: number) => {
								return <td key={i} style={{ ...tdstyle, fontSize: 0.9 * (fontSize / 100) + "em" }}>
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


function downloadHTMLElementWithID(monthAndYear: string, parentID: string = "") {
	var els = document.getElementsByClassName(monthAndYear);
	if(parentID != "") {
		var parent = document.getElementById(parentID)! as HTMLElement;
		els = parent.getElementsByClassName(monthAndYear);
		parent.style.setProperty("display", "block")
	}
	for(let i = 0; i < els.length; i++) {
		html2canvas(els[i] as HTMLElement, { scrollX: -window.scrollX, scale: 6 }).then(canvas => {
			var link = document.createElement('a');
			link.download = monthAndYear + '.jpg';
			link.href = canvas.toDataURL("image/jpeg", 0.9);
			link.click();
		});
	}
	if(parentID != "") {
		(document.getElementById(parentID)! as HTMLElement).style.setProperty("display", "none")
	}

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