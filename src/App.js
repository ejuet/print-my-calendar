import logo from "./logo.svg";
import "./App.css";
import * as ICAL from "ical.js";
import { testcontent } from "./testics";
import { testcontent2 } from "./testics2";
import { CalendarList, ListEvents, exampleReadICS } from "./calendar.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  exampleReadICS(testcontent2);

  return (
    <div className="App">
      <h1>Upload Files</h1>
      <input
        type="file"
        accept="ics"
        multiple
        onChange={(e) => {
          var files = e.target.files;
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.name.endsWith(".ics")) {
              let fr = new FileReader();
              fr.onload = function () {
                console.log(fr.result);
                console.log(typeof fr.result);
                exampleReadICS(fr.result);
              };
              fr.readAsText(file);
            } else {
              window.alert("Please only upload .ics files");
            }
          }
        }}
      ></input>
      <CalendarList />
    </div>
  );
}

export default App;
