import React from 'react';
import { Link } from 'react-router-dom';

/*
This component is for each navbar bar link contained in the sidebar component
*/

interface NavItemProps {
  linkText: string;
  active: boolean;
}

function NavItem({ linkText, active }: NavItemProps) {
  // Generate a custom path based on the link text
  const path = `/${linkText.replace(/\s+/g, '').toLowerCase()}`;

  return (
    <li className={`nav-item bg-light`}>
      <Link to={path} className={`nav-link btn ${active ? 'btn-success' : 'btn-secondary'}`}>{linkText}</Link>
    </li>
  );
}

export default NavItem;
