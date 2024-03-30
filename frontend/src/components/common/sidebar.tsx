import NavItem from './navitem';
import UserProfile from './profile';
import { BiHome, BiLogOut, BiChart, BiCommand, BiSearch } from 'react-icons/bi'; // Import icons


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
        <NavItem linkText="Home" active={currentPage === '/'} icon={<BiHome />} />
        <NavItem linkText="Logout" active={currentPage === '/logout'} icon={<BiLogOut />} />
        <NavItem linkText="Mood Log" active={currentPage === '/moodlog'} icon={<BiChart />} />
        <NavItem linkText="Recommend" active={currentPage === '/recommend'} icon={<BiCommand />} />
        <NavItem linkText="Discover" active={currentPage === '/discover'} icon={<BiSearch />} />
      </ul>
    </div>
  );
}

export default Sidebar;
