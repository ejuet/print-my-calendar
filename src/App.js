import logo from './logo.svg';
import './App.css';
import * as ICAL from "ical.js"
import { testcontent } from './testics';
import { testcontent2 } from './testics2';

function App() {

  exampleReadICS(testcontent2)

  return (
    <div className="App">
      <h1>Upload File</h1>
      <input type="file" accept='ics' multiple onChange={(e) => {

        var files = e.target.files;
        for (let i = 0; i < files.length; i++) {

          let fr = new FileReader();
          fr.onload = function () {
            console.log(fr.result);
            console.log(typeof fr.result);
            exampleReadICS(fr.result);
          }
          fr.readAsText(files[i]);
        }
      }}></input>
    </div>
  );
}

export default App;


function exampleReadICS(textcontent) {
  var data = ICAL.parse(textcontent);
  console.log(data);
  var vcal = new ICAL.Component(data);
  var events = vcal.getAllSubcomponents("vevent");
  for (let j = 0; j < events.length; j++) {
    var ev = new ICAL.Event(events[j]);
    console.log(ev.summary);
    console.log(ev.isRecurring());

    let iter = ev.iterator(ev.startDate)
    for (let next = iter.next(); next; next = iter.next()) {
      console.log(next.toString());
    }

  }
}

