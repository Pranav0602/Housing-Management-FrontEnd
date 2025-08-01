import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserFriends, FaHistory, FaBell, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const GuardSidebar = () => {
  const { logout, currentUser } = useAuth();

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Guard Portal</h2>
        <p className="text-sm text-gray-400 mt-1">{currentUser?.societyName || 'Society Guard'}</p>
      </div>
      
      <nav className="flex-grow">
        <ul className="space-y-1 py-4">
          <li>
            <NavLink 
              to="/guard/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaTachometerAlt className="mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/guard/visitors" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaUserFriends className="mr-3" />
              Visitor Log
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/guard/visitor-history" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaHistory className="mr-3" />
              Visitor History
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/guard/notices" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaBell className="mr-3" />
              Notices
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={logout}
          className="flex items-center text-gray-300 hover:text-white transition"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default GuardSidebar;