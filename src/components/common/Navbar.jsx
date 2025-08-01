import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Housing Society
        </Link>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated() ? (
            <>
              <span className="hidden md:inline">Welcome, {currentUser.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-transparent border border-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;