import React from 'react';
import NavItem from './navitem';

function Sidebar() {
  return (
    <div className="sidebar col-md-2">
      <ul className="nav flex-column">
        <NavItem linkText="Home" />
        <NavItem linkText="About" />
        <NavItem linkText="Services" />
        <NavItem linkText="Contact" />
      </ul>
    </div>
  );
}

export default Sidebar;
