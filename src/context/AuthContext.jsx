import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import { flatService } from '../services/api';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAllocatedFlat, setHasAllocatedFlat] = useState(null);
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };
  // Check if resident has an allocated flat
  const checkFlatAllocation = async () => {
    if (!currentUser || currentUser.role !== 'RESIDENT') {
      return true; // Not applicable for non-residents
    }

    try {
      const response = await flatService.getMyFlat();
      const hasFlat = !!(response.data && response.data.id);
      setHasAllocatedFlat(hasFlat);
      return hasFlat;
    } catch (error) {
      // Specifically handle 404 for residents without a flat
      if (error.response && error.response.status === 404) {
        setHasAllocatedFlat(false);
        return false;
      }
      console.error('Error checking flat allocation:', error);
      setHasAllocatedFlat(false);
      return false;
    }
  };

  // Load user from localStorage on component mount
  useEffect(() => {
    const loadUser = async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr && !isTokenExpired(token)) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        if (user.role === 'RESIDENT') {
            await checkFlatAllocation();
          }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  };
  loadUser();
}, []);
  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
       const sanitizedUserData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: userData.role,
        societyId: userData.societyId
      };

        // If user is admin and creating a society, include only the expected fields
      if (userData.role === 'ADMIN' && userData.societyCreationRequest) {
        sanitizedUserData.societyCreationRequest = {
          name: userData.societyCreationRequest.name,
          address: userData.societyCreationRequest.address,
          city: userData.societyCreationRequest.city,
          state: userData.societyCreationRequest.state,
          pincode: userData.societyCreationRequest.pincode,
          numberOfBuildings: userData.societyCreationRequest.numberOfBuildings
        };
      }
      const response = await authService.register(sanitizedUserData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      const { token, tokenType, expiresIn, userId, name, email, role, societyId, societyName } = response.data;
      
      // Save token and user data to localStorage
      localStorage.setItem('token', token);
      
      const user = {
        id: userId,
        name,
        email,
        role,
        societyId,
        societyName
      };
     

      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      toast.success('Login successful!');
      
      // Redirect based on user role
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'RESIDENT') {
        // Check if resident has an allocated flat
        const hasFlat = await checkFlatAllocation();
        if (hasFlat) {
          navigate('/resident/dashboard');
        } else {
          // Redirect to flat allocation request form if no flat is allocated
          navigate('/resident/request-allocation');
          toast.info('Please submit a flat allocation request to continue.');
        }
      } else if (role === 'GUARD') {
        navigate('/guard/dashboard');
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    toast.info('You have been logged out');
    navigate('/login');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token && !isTokenExpired(token);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser && currentUser.role === role;
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    hasAllocatedFlat,
    register,
    login,
    logout,
    isAuthenticated,
    hasRole,
    checkFlatAllocation
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;