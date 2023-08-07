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
      
      <CalendarList />
    </div>
  );
}

export default App;
