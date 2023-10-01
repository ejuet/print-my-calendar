import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
  NavLink
} from "react-router-dom";

import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { CalendarList } from './calendar.tsx';


/*
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/

const router = createBrowserRouter([
  {
    path: "/",
    element: <WithNavbar>
      
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
      <Navbar.Brand href="">Print Your Calendar</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          <NavLink to="/calendar">Calendar Download</NavLink>
        </Nav>
        <Nav>
          <NavLink to="/credits">Info & Credits</NavLink>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
