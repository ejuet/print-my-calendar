import React, { useState } from "react";
import html2canvas from "html2canvas";
import { Time, Timezone } from "ical.js";
import { Accordion, Button, DropdownButton, Form } from "react-bootstrap";
import AccordionBody from "react-bootstrap/esm/AccordionBody";
import AccordionHeader from "react-bootstrap/esm/AccordionHeader";
import AccordionItem from "react-bootstrap/esm/AccordionItem";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { testcontent } from "../../testics";
import { testcontent2 } from "../../testics2";
import { DownloadButton } from "../components/download-button";
import { DatePicker, MyNumberInput, MyTextInput } from "../components/inputs";
import { Calendar } from "../lib/calendar-model";
import { defaultEventNameReplacements } from "../lib/constants";
import { exampleReadICS } from "../lib/ics";
import { calendarRenderers, getCalendarRendererById } from "../renderers";

type EventNameReplacement = {
	from: string;
	to: string;
};

type EventTitleTemplateMap = Record<string, string>;

export function ListEvents() {
	return (
		<>
			<div id="capture">
				<ExampleEventList />
			</div>
			<Button
				onClick={() => {
					html2canvas(document.querySelector("#capture")!).then((canvas) => {
						const link = document.createElement("a");
						link.download = "calendar.png";
						link.href = canvas.toDataURL();
						link.click();
					});
				}}
			>
				Download
			</Button>
		</>
	);
}

function ExampleEventList() {
	const cal = exampleReadICS(testcontent2 || testcontent);
	const timezone = Timezone.fromData({
		tzid: "(GMT +02:00)",
	});
	const today = Time.fromJSDate(new Date(), false);

	return (
		<div>
			<p>Today: {JSON.stringify(today)}</p>
			<p>Timezone: {timezone.toString()}</p>
			<p>Earliest: {cal.getEarliestStartDate()?.startDate.toString()}</p>
			<p>Last: {cal.getLatestEndDate()?.endDate.toString()}</p>
			{cal.getAllEvents().map((e) => {
				return (
					<div key={e.startDate.toString() + e.summary}>
						<h2>{e.summary}</h2>
						<p>
							{e.startDate.toString()} bis {e.endDate.toString()}
						</p>
						{e.isToday(today) && <b>Today</b>}
					</div>
				);
			})}
		</div>
	);
}

export function CalendarList() {
	const [calendars, setCalendars] = useState<Calendar[]>([]);
	const [eventNameReplacements, setEventNameReplacements] = useState<EventNameReplacement[]>(
		Object.entries(defaultEventNameReplacements).map(([from, to]) => ({ from, to })),
	);
	const [eventTitleTemplatesByCalendar, setEventTitleTemplatesByCalendar] = useState<EventTitleTemplateMap>({});
	const [startOfCalendar, setStart] = useState(
		new Time({
			year: new Date().getFullYear(),
			month: 1,
			day: 1,
		}),
	);
	const [endOfCalendar, setEnd] = useState(
		new Time({
			year: new Date().getFullYear(),
			month: 12,
			day: 31,
		}),
	);
	const [selectedRendererId, setSelectedRendererId] = useState(calendarRenderers[0]?.id ?? "");
	const [rendererSettingsById, setRendererSettingsById] = useState<Record<string, unknown>>(() =>
		Object.fromEntries(calendarRenderers.map((renderer) => [renderer.id, renderer.createDefaultSettings()])),
	);
	const replacementMap = toReplacementMap(eventNameReplacements);
	const selectedRenderer = getCalendarRendererById(selectedRendererId);
	const rendererSettings = (rendererSettingsById[selectedRenderer.id] ?? selectedRenderer.createDefaultSettings()) as never;
	const RendererPreview = selectedRenderer.PreviewComponent;
	const RendererSettings = selectedRenderer.SettingsComponent;
	const updateEventTitleTemplate = (calendarId: string, nextTemplate: string) => {
		setEventTitleTemplatesByCalendar((old) => {
			if(nextTemplate.trim() === "") {
				const { [calendarId]: _, ...rest } = old;
				return rest;
			}

			return {
				...old,
				[calendarId]: nextTemplate,
			};
		});
	};
	const rendererProps = {
		startOfCalendar,
		endOfCalendar,
		calendars,
		eventNameReplacements: replacementMap,
		eventTitleTemplatesByCalendar,
		settings: rendererSettings,
	};

	return (
		<>
			<h1 style={{ fontSize: "60px", marginTop: "5vh" }}>Print Your Calendar</h1>
			<p>Follow these steps to create your own Calendar:</p>
			<div style={{ marginLeft: "13vw", marginRight: "13vw", marginTop: "5vh", marginBottom: "5vh" }}>
				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Pick your Calendar Data</AccordionHeader>
						<AccordionBody>
							<p>Choose what events you want in your calendar.</p>
							<ul>
								<li>You can import events from Google Calendar or other digital calendars.</li>
								<li>You can use any data that is in a file that ends with <code>.ics</code></li>
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
							<input type="file" accept="ics" multiple onChange={(e) => handleFileUpload(e.target.files, setCalendars)} />
						</AccordionBody>
					</Accordion.Item>
				</Accordion>

				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Choose a Calendar Layout</AccordionHeader>
						<AccordionBody>
							<p>Pick the layout renderer you want to use for preview and PDF export.</p>
							<Form.Select value={selectedRenderer.id} onChange={(e) => setSelectedRendererId(e.target.value)}>
								{calendarRenderers.map((renderer) => {
									return (
										<option key={renderer.id} value={renderer.id}>
											{renderer.name}
										</option>
									);
								})}
							</Form.Select>
						</AccordionBody>
					</AccordionItem>
				</Accordion>

				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Preview your Calendar</AccordionHeader>
						<AccordionBody>
							<p>Scroll to the bottom of the page to preview your calendar.</p>
							<p>Then, go to the next sections ("Rename and Reorder Columns", "Calendar Settings", or "Layout Settings") if you want to make any changes.</p>
						</AccordionBody>
					</AccordionItem>
				</Accordion>

				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Rename and Reorder Columns</AccordionHeader>
						<AccordionBody>
							{calendars.map((cal, index) => {
								return (
									<div key={index} className="d-flex justify-content-center" style={{ gap: 10, margin: 15 }}>
										<MyTextInput
											value={cal.name}
											onBlur={(e) => {
												const nextCalendars = [...calendars];
												nextCalendars[index].name = e.target.value;
												setCalendars(nextCalendars);
											}}
										/>
										<Button onClick={() => setCalendars([...calendars].filter((_, ind) => ind !== index))}>Delete</Button>
										{calendars.filter((c) => c !== cal).length > 0 && (
											<DropdownButton title="Merge">
												{calendars.map((other, i) => {
													if(other !== cal) {
														return (
															<DropdownItem
																key={i}
																onClick={() => {
																	const merged = cal.mergeWithCalendar(other);
																	setCalendars((old) => [...old.filter((o) => o !== other && o !== cal), merged]);
																}}
															>
																Merge with {other.name}
															</DropdownItem>
														);
													}
													return null;
												})}
											</DropdownButton>
										)}
										{cal.getIsMerged() && <Button onClick={() => setCalendars((old) => [...old.filter((o) => o !== cal), ...cal.splitCalendar()])}>Split</Button>}
										{calendars.length > 1 && (
											<>
												<Button onClick={() => setCalendars((old) => swap([...old], index, index - 1))}>Move Left</Button>
												<Button onClick={() => setCalendars((old) => swap([...old], index, index + 1))}>Move Right</Button>
											</>
										)}
										<MyNumberInput
											min={0}
											max={1}
											value={cal.width}
											onBlur={(e) => {
												const nextCalendars = [...calendars];
												nextCalendars[index].width = Number(e.target.value);
												setCalendars(nextCalendars);
											}}
										/>
									</div>
								);
							})}

							<Button onClick={() => setCalendars((old) => [...old, new Calendar("New Calendar")])}>Add Empty Column</Button>
						</AccordionBody>
					</AccordionItem>
				</Accordion>

				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Edit Event Name Replacements</AccordionHeader>
						<AccordionBody>
							<p>Replace event names or parts of event names with your own labels, words, or emoji.</p>
							{eventNameReplacements.map((replacement, index) => {
								return (
									<div key={index} className="d-flex justify-content-center align-items-center" style={{ gap: 10, margin: 15, flexWrap: "wrap" }}>
										<MyTextInput
											value={replacement.from}
											onBlur={(e) => {
												setEventNameReplacements((old) =>
													old.map((item, itemIndex) => itemIndex === index ? { ...item, from: e.target.value } : item),
												);
											}}
										/>
										<span>→</span>
										<MyTextInput
											value={replacement.to}
											onBlur={(e) => {
												setEventNameReplacements((old) =>
													old.map((item, itemIndex) => itemIndex === index ? { ...item, to: e.target.value } : item),
												);
											}}
										/>
										<Button variant="outline-danger" onClick={() => setEventNameReplacements((old) => old.filter((_, itemIndex) => itemIndex !== index))}>
											Delete
										</Button>
									</div>
								);
							})}

							<div className="d-flex justify-content-center" style={{ gap: 10, marginTop: 15, flexWrap: "wrap" }}>
								<Button onClick={() => setEventNameReplacements((old) => [...old, { from: "", to: "" }])}>Add Replacement</Button>
								<Button variant="outline-secondary" onClick={() => setEventNameReplacements(Object.entries(defaultEventNameReplacements).map(([from, to]) => ({ from, to })))}>
									Reset to Trash Defaults
								</Button>
							</div>
						</AccordionBody>
					</AccordionItem>
				</Accordion>

				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Edit Column Event Title Templates</AccordionHeader>
						<AccordionBody>
							<p>Wrap or rewrite event titles for a specific column. Use <code>{"{title}"}</code> where the event name should appear, for example <code>🎂 {"{title}"} 🎂</code>.</p>
							{calendars.length === 0 && <p>Import or add a column first to configure its event title template.</p>}
							{calendars.map((calendar, index) => (
								<div key={calendar.id} style={{ margin: 15 }}>
									<div className="d-flex justify-content-center align-items-center" style={{ gap: 10, flexWrap: "wrap" }}>
										<div style={{ minWidth: 180, fontWeight: 700 }}>{calendar.name || `Column ${index + 1}`}</div>
										<Form.Control
											type="text"
											placeholder='Example: 🎂 {title} 🎂'
											defaultValue={eventTitleTemplatesByCalendar[calendar.id] ?? ""}
											onBlur={(e) => updateEventTitleTemplate(calendar.id, e.target.value)}
											style={{ maxWidth: 420 }}
										/>
									</div>
									{calendar.getIsMerged() && (
										<div style={{ marginTop: 12 }}>
											<p style={{ textAlign: "center", marginBottom: 10 }}>Templates for events from the original calendars inside this merged column:</p>
											{calendar.getSourceCalendars().map((sourceCalendar) => (
												<div
													key={sourceCalendar.id}
													className="d-flex justify-content-center align-items-center"
													style={{ gap: 10, margin: "10px 0", flexWrap: "wrap" }}
												>
													<div style={{ minWidth: 180 }}>{sourceCalendar.name}</div>
													<Form.Control
														type="text"
														placeholder='Example: 🎂 {title} 🎂'
														defaultValue={eventTitleTemplatesByCalendar[sourceCalendar.id] ?? ""}
														onBlur={(e) => updateEventTitleTemplate(sourceCalendar.id, e.target.value)}
														style={{ maxWidth: 420 }}
													/>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</AccordionBody>
					</AccordionItem>
				</Accordion>

				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Calendar Settings</AccordionHeader>
						<AccordionBody>
							<h3>Start Date</h3>
							<DatePicker defaultYear={startOfCalendar.year} defaultMonth={startOfCalendar.month} defaultDay={startOfCalendar.day} onNewDate={(t) => setStart(t.clone())} />

							<h3>End Date</h3>
							<DatePicker defaultYear={endOfCalendar.year} defaultMonth={endOfCalendar.month} defaultDay={endOfCalendar.day} onNewDate={(t) => setEnd(t.clone())} />
						</AccordionBody>
					</AccordionItem>
				</Accordion>

				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Layout Settings</AccordionHeader>
						<AccordionBody>
							<RendererSettings
								settings={rendererSettings}
								setSettings={(update) => {
									setRendererSettingsById((old) => {
										const currentSettings = (old[selectedRenderer.id] ?? selectedRenderer.createDefaultSettings()) as never;
										const nextSettings = typeof update === "function" ? update(currentSettings) : update;
										return {
											...old,
											[selectedRenderer.id]: nextSettings,
										};
									});
								}}
							/>
						</AccordionBody>
					</AccordionItem>
				</Accordion>

				<Accordion>
					<AccordionItem eventKey="0">
						<AccordionHeader>Generate a PDF File</AccordionHeader>
						<AccordionBody>
							<p>
								If you are happy with how your calendar looks, click the Button below to turn it into a PDF File. <br />
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
								<br />
								Open your "Downloads" folder and print it.
							</p>
						</AccordionBody>
					</AccordionItem>
				</Accordion>
			</div>

			<h1>Result</h1>
			<DownloadButton renderer={selectedRenderer} rendererProps={rendererProps} />
			<RendererPreview {...rendererProps} />
		</>
	);
}

function toReplacementMap(replacements: EventNameReplacement[]) {
	return replacements.reduce<Record<string, string>>((result, replacement) => {
		if(replacement.from !== "") {
			result[replacement.from] = replacement.to;
		}
		return result;
	}, {});
}

function handleFileUpload(files: FileList | null, setCalendars: React.Dispatch<React.SetStateAction<Calendar[]>>) {
	if(!files) {
		return;
	}

	for(let i = 0; i < files.length; i++) {
		const file = files[i];
		if(file.name.endsWith(".ics")) {
			const fr = new FileReader();
			fr.onload = function () {
				setCalendars((oldCals) => [...oldCals, exampleReadICS(String(fr.result))]);
			};
			fr.readAsText(file);
		} else {
			window.alert("Please only upload .ics files");
		}
	}
}

function swap<T>(arr: T[], a: number, b: number) {
	if(a < 0 || a >= arr.length || b < 0 || b >= arr.length) {
		return arr;
	}

	const temp = arr[a];
	arr[a] = arr[b];
	arr[b] = temp;
	return arr;
}
