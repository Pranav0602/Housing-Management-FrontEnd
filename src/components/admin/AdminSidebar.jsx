import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBuilding, FaHome, FaUsers, FaBell, FaClipboardList, FaMoneyBillWave, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const AdminSidebar = () => {
  const { logout, currentUser } = useAuth();

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-gray-400 mt-1">{currentUser?.societyName || 'Society Admin'}</p>
      </div>
      
      <nav className="flex-grow">
        <ul className="space-y-1 py-4">
          <li>
            <NavLink 
              to="/admin/dashboard" 
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
              to="/admin/buildings" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaBuilding className="mr-3" />
              Buildings
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/flats" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaHome className="mr-3" />
              Flats
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/residents" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaUsers className="mr-3" />
              Residents
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/allocation-requests" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaClipboardList className="mr-3" />
              Allocation Requests
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/notices" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaBell className="mr-3" />
              Notices
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/maintenance" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 hover:bg-gray-700 transition ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <FaMoneyBillWave className="mr-3" />
              Maintenance Bills
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

export default AdminSidebar;