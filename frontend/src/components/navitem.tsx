import React from 'react';

interface NavItemProps {
    linkText: string;
  }

function NavItem({ linkText }: NavItemProps) {
  return (
    <li className="nav-item bg-light">
      <a className="nav-link btn btn-success" href="#">{linkText}</a>
    </li>
  );
}

export default NavItem;
