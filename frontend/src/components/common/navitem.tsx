import React from 'react';
import { Link } from 'react-router-dom';

/*
This component is for each navbar bar link contained in the sidebar component
*/

interface NavItemProps {
  linkText: string;
  active: boolean;
  // icon: React.ReactNode; // Define icon prop as ReactNode
  onClick?: () => void;
}

function NavItem({ linkText, active, onClick }: NavItemProps) {
  // Generate a custom path based on the link text
  const path = `/${linkText.replace(/\s+/g, '').toLowerCase()}`;

  return (
    <li className={`nav-item m-1`}>
      <Link onClick={onClick}  to={path} >
        {/* <span className="m-2">{icon}</span> */}
        {linkText}</Link>
    </li>
  );
}

export default NavItem;
