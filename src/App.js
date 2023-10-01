import logo from "./logo.svg";
import "./App.css";
import * as ICAL from "ical.js";
import { testcontent } from "./testics";
import { testcontent2 } from "./testics2";
import { CalendarList, ListEvents, exampleReadICS } from "./calendar.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";

function App() {
  exampleReadICS(testcontent2);

  return (
    <div className="App">
      <MyNavbar />
      
      <CalendarList />
    </div>
  );
}

function MyNavbar(){
  return <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
  <Container>
    <Navbar.Brand href="#home">Print Your Calendar</Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    <Navbar.Collapse id="responsive-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link >Calendar Download</Nav.Link>
      </Nav>
      <Nav>
        <Nav.Link href="#deets">Info & Credits</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
}

export default App;
