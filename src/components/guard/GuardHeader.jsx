import { useState } from 'react';
import { FaBell, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';

const GuardHeader = () => {
  const { currentUser } = useAuth();
  const { notifications } = useWebSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">Guard Portal</h1>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="p-2 rounded-full hover:bg-gray-100 relative"
          >
            <FaBell className="text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div>
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className="p-3 border-b border-gray-200 hover:bg-gray-50">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Profile */}
        <div className="relative">
          <button 
            onClick={toggleProfile}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <FaUser />
            </div>
            <span className="hidden md:inline text-gray-700">{currentUser?.name}</span>
          </button>
          
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-medium">{currentUser?.name}</h3>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                  Profile Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default GuardHeader;