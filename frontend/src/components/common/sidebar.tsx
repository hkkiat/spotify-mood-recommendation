import { useMutation } from '@apollo/react-hooks';
import NavItem from './navitem';
import UserProfile from './profile';
import { BiHome, BiLogOut, BiChart, BiCommand, BiSearch } from 'react-icons/bi'; // Import icons
import { logout } from '../../graphql/mutations/SessionControl';
import { Logout } from '../../graphql/mutations/__generated__/Logout';
import { useNavigate } from 'react-router-dom';


/*
This component is used to display navitem components
*/

interface SideBarProps {
  currentPage: string;
}

function Sidebar({ currentPage }: SideBarProps) {
  const navigate = useNavigate();

  const [logoutUser] = useMutation<Logout>(logout,
    {
      onCompleted: () => {
        navigate('/')
      }
    })
  

  return (
    <div className="sidebar">
      <ul className="nav flex-column">
        <UserProfile></UserProfile>
        <NavItem linkText="Home" active={currentPage === '/home'} />
        <NavItem onClick={logoutUser} linkText="Logout" active={currentPage === '/logout'} />
        <NavItem linkText="Mood Log" active={currentPage === '/moodlog'}  />
        <NavItem linkText="Recommend" active={currentPage === '/recommend2'}  />
        <NavItem linkText="Discover" active={currentPage === '/discover'}  />
      </ul>
    </div>
  );
}

export default Sidebar;
