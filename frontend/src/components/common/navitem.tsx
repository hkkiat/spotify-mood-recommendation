import React from 'react';
import { Link } from 'react-router-dom';

/*
This component is for each navbar bar link contained in the sidebar component
*/

interface NavItemProps {
  linkText: string;
  active: boolean;
  icon: React.ReactNode; // Define icon prop as ReactNode
}

function NavItem({ linkText, active, icon }: NavItemProps) {
  // Generate a custom path based on the link text
  const path = `/${linkText.replace(/\s+/g, '').toLowerCase()}`;

  return (
    <li className={`nav-item m-1`}>
      <Link to={path} className={`nav-link btn rounded`}
        style={{ backgroundColor: active ? '#008080' : '#8D8DDA', color: '#fff' }}>
        <span className="m-2">{icon}</span>
        {linkText}</Link>
    </li>
  );
}

export default NavItem;
