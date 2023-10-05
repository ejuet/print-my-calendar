import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  createHashRouter
} from "react-router-dom";

import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { CalendarList, Credits } from './calendar.tsx';


/*
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/

const router = createHashRouter([
  {
    path: "/",
    element: <WithNavbar>
      <HeroImage />
    </WithNavbar>
  },
  {
    path: "calendar",
    element: <WithNavbar>
      <CalendarList />
    </WithNavbar>
  },
  {
    path: "credits",
    element: <WithNavbar>
      <Credits />
    </WithNavbar>
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <div className='App'>
    <RouterProvider router={router} />
  </div>
);

function WithNavbar({ children }) {
  return <>
    <MyNavbar />
    {children}
  </>
}

function MyNavbar() {
  return <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
    <Container>
      <NavLink to="/" onlyActiveOnIndex exact activeClassName="active">
        <Navbar.Brand href="" >Print Your Calendar</Navbar.Brand>

      </NavLink>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link>
            <NavLink to="/">Home</NavLink>
          </Nav.Link>
          <Nav.Link>
            <NavLink to="/calendar">Calendar Download</NavLink>
          </Nav.Link>
        </Nav>
        <Nav>
          <NavLink to="/credits">Info & Credits</NavLink>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
}

export default function HeroImage() {
  return (
    <header style={{ paddingLeft: 0 }}>
      <div
        className='text-center bg-image'
        style={{
          backgroundImage: "url('printer.jpg')",
          height: 400,
          backgroundSize: "cover",
          backgroundPosition: "right top"
        }}
      >
        <div className='mask h-100' style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', margin: 0 }}>
          <div className='d-flex justify-content-center align-items-center h-100'>
            <div className='text-dark'>
              <h1 className='mb-3'>Print Your Calendar</h1>
              <h4 className='mb-3'>Download and print your own Calendar in 7 easy steps</h4>
              <NavLink className='btn btn-outline-dark btn-lg' to="/calendar" role="button">Use for free</NavLink>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
