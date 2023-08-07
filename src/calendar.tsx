
import { parse, Component, Event, Time, Timezone, TimezoneService, Duration } from "ical.js"
import { testcontent } from './testics';
import { testcontent2 } from './testics2';
import React from "react";
import html2canvas from "html2canvas";
import { Button, Table } from "react-bootstrap";


export function exampleReadICS(textcontent) {
  let calendar = new Calendar();

  var data = parse(textcontent);
  console.log(data);
  var vcal = new Component(data);
  var events = vcal.getAllSubcomponents("vevent");
  for (let j = 0; j < events.length; j++) {
    var ev = new Event(events[j]);
    /*
    console.log(ev.summary);
    console.log(ev.duration.toSeconds());
    console.log(ev.isRecurring());
    */

    //iterate over dates of event
    //TODO stop iteration when recurring is infinite => only for a few years or so
    let iter = ev.iterator(ev.startDate)
    for (let next = iter.next(); next; next = iter.next()) {

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
    tzid:"(GMT +02:00)"
  });
  const today = Time.fromJSDate(new Date(), false);
  return <>
    <div>
      <p>Today: {JSON.stringify(today)}</p>
      <p>Timezone: {timezone.toString()}</p>
      <p>Earliest: {cal.getEarliestStartDate()?.startDate.toString()}</p>
      <p>Last: {cal.getLatestEndDate()?.startDate.toString()}</p>
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

  function getD(){
    var today = Time.fromJSDate(new Date(), false);
    today = today.convertToZone(timezone);
    //today = today.convertToZone(Timezone.utcTimezone);
    return Timezone.convert_time(today, timezone, Timezone.utcTimezone);
  }
}

export function CalendarList(){
  const cal = exampleReadICS(testcontent2);
  const startOfCalendar = new Time({
    year: 2023,
    month:1,
    day:1
  })
  const endOfCalendar = new Time({
    year: 2023,
    month:12,
    day:31
  })

  getDays();
  return <>
    <Table>
      <tr >
        <td >A</td>
        <td >B</td>
        <td >C</td>
      </tr>
    </Table>
  </>

  function getDays(){
    var c = startOfCalendar.clone();
    while(c.compare(endOfCalendar)<=0){
      console.log(c.toString());
      c.addDuration(Duration.fromData({days:1}));
    }
  }
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
    this.summary = summary;
    this.endDate = startDate.clone();
    this.endDate.addDuration(duration);
  }

  isToday(date: Time) {
    var utcTimezone = Timezone.utcTimezone;
    return date.compareDateOnlyTz(this.startDate, utcTimezone) >= 0 && date.compareDateOnlyTz(this.endDate, utcTimezone) <= 0
  }

}

class Calendar {
  items: CalendarEvent[]
  constructor() {
    this.items = []
  }

  addEvent(ev: CalendarEvent) {
    this.items.push(ev);
  }

  getEvent(date: Time) {
    var today: CalendarEvent[];
    today = []
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].isToday(date)) {
        today.push(this.items[i]);
      }
    }
    return today;
  }

  getAllEvents() {
    return this.items;
  }

  getMinMaxStartDate(mult: number){ //mult=1 => min
    if(this.items.length==0){
      return null;
    }
    let earliest = this.items[0];
    for (let i = 1; i < this.items.length; i++) {
      if (this.items[i].startDate.compare(earliest.startDate)*mult<0) {
        earliest=this.items[i];
      }
    }
    return earliest;
  }

  getMinMaxEndDate(mult: number){ //mult=1 => min
    if(this.items.length==0){
      return null;
    }
    let earliest = this.items[0];
    for (let i = 1; i < this.items.length; i++) {
      if (this.items[i].endDate.compare(earliest.endDate)*mult<0) {
        earliest=this.items[i];
      }
    }
    return earliest;
  }

  getEarliestStartDate(){
    return this.getMinMaxStartDate(1);
  }
  getLatestEndDate(){
    return this.getMinMaxEndDate(-1);
  }

}