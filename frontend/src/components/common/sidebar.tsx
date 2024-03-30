import NavItem from './navitem';
import UserProfile from './profile';

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
        <UserProfile></UserProfile>
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
