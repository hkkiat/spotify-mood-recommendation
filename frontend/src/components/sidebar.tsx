import React from 'react';
import NavItem from './navitem';

/*
This component is used to display navitem components
*/

interface SideBarProps {
  currentPage: string;
}

function Sidebar({ currentPage }: SideBarProps) {
  return (
    <div className="sidebar">
      <ul className="nav flex-column">
        <NavItem linkText="Home" active={currentPage === '/'} />
        <NavItem linkText="Logout" active={currentPage === '/logout'} />
        <NavItem linkText="Mood Log" active={currentPage === '/moodlog'} />
        <NavItem linkText="Analysis" active={currentPage === '/analysis'} />
        <NavItem linkText="Recommend" active={currentPage === '/recommend'} />
        <NavItem linkText="Discover" active={currentPage === '/discover'} />
      </ul>
    </div>
  );
}

export default Sidebar;
