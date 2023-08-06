
import {parse, Component, Event, Time} from "ical.js"
import { testcontent } from './testics';
import { testcontent2 } from './testics2';

export function exampleReadICS(textcontent) {
    let calendar = new Calendar();

    var data = parse(textcontent);
    console.log(data);
    var vcal = new Component(data);
    var events = vcal.getAllSubcomponents("vevent");
    for (let j = 0; j < events.length; j++) {
      var ev = new Event(events[j]);
      console.log(ev.summary);
      console.log(ev.duration.toSeconds());
      console.log(ev.isRecurring());
  
      //iterate over dates of event
      let iter = ev.iterator(ev.startDate)
      for (let next = iter.next(); next; next = iter.next()) {

        let calenderEv = new CalendarEvent(next, ev.duration, ev.summary);
        calendar.addEvent(calenderEv);
        //console.log(calenderEv)
      }
  
    }

    console.log(calendar);
  }

class CalendarEvent{
    startDate: any;
    summary: string;
    duration:any;
    durationInSeconds: number;
    endDate: any;
    constructor(startDate: any, duration: any, summary: string){
        this.startDate=startDate;
        this.durationInSeconds=duration.toSeconds();
        this.summary=summary;
        this.endDate = startDate.clone();
        this.endDate.addDuration(duration);
    }

}

class Calendar{
    items:CalendarEvent[]
    constructor(){
        this.items=[]
    }

    addEvent(ev:CalendarEvent){
        this.items.push(ev);
    }

}