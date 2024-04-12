import React from 'react';
import { NavLink } from 'react-router-dom';
import {Outlet} from 'react-router-dom';
import classes from './CSS/eventcard.module.css';


function NavbarStudent() {
  return (
    <div>
    <nav className="navbar">
      <div className={classes.container}>
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink to="/student/home" className="nav-link">
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/student/event" className="nav-link">
              Events
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/student/internship" className="nav-link">
              Internships
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/student/profile" className="nav-link">
              Profile
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
    <Outlet/>
    </div>
  );
}

export default NavbarStudent;
