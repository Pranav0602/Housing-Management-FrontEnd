import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated, checkFlatAllocation } = useAuth();
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState('');
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated()) {
        setRedirectPath('/login');
        setLoading(false);
        return;
      }

      if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect to the appropriate dashboard if the role is not allowed
        const roleDashboard = {
          ADMIN: '/admin/dashboard',
          RESIDENT: '/resident/dashboard',
          GUARD: '/guard/dashboard'
        };
        setRedirectPath(roleDashboard[currentUser.role] || '/');
        setLoading(false);
        return;
      }
      
      if (currentUser.role === 'RESIDENT' && location.pathname !== '/resident/request-allocation') {
        const hasFlat = await checkFlatAllocation();
        if (!hasFlat) {
          setRedirectPath('/resident/request-allocation');
        }
      }
      
      setLoading(false);
    };

    checkAccess();
  }, [currentUser, isAuthenticated, allowedRoles, location.pathname, checkFlatAllocation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;