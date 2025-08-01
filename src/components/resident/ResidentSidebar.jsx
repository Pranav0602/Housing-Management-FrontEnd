import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaUsers, FaExclamationTriangle, FaMoneyBillWave, FaBell, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const ResidentSidebar = () => {
  const { logout, currentUser } = useAuth();

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Resident Portal</h2>
        <p className="text-sm text-gray-400 mt-1">{currentUser?.societyName || 'Society Resident'}</p>
      </div>
      
      <nav className="flex-grow">
        <ul className="space-y-1 py-4">
          <li>
            <NavLink 
              to="/resident/dashboard" 
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
              to="/resident/flat" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaHome className="mr-3" />
              My Flat
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/resident/family-members" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaUsers className="mr-3" />
              Family Members
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/resident/complaints" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaExclamationTriangle className="mr-3" />
              Complaints
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/resident/maintenance" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaMoneyBillWave className="mr-3" />
              Maintenance Bills
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/resident/notices" 
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

export default ResidentSidebar;