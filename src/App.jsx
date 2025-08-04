import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ResidentLayout from './components/layouts/ResidentLayout';
import GuardLayout from './components/layouts/GuardLayout';

// Common Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBuildings from './pages/admin/AdminBuildings';
import AdminFlats from './pages/admin/AdminFlats';
import AdminResidents from './pages/admin/AdminResidents';
import AdminAllocationRequests from './pages/admin/AdminAllocationsRequests';
import AdminNotices from './pages/admin/AdminNotices';
import AdminMaintenance from './pages/admin/AdminMaintenance';

// Resident Pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import ResidentFlat from './pages/resident/ResidentFlat';
import ResidentFamilyMembers from './pages/resident/ResidentFamilyMembers';
import ResidentComplaints from './pages/resident/ResidentComplaints';
import FlatAllocationRequestForm from './pages/resident/FlatAllocationRequestForm';

// Guard Pages
import GuardDashboard from './pages/guard/GuardDashboard';
import VisitorForm from './pages/guard/VisitorForm';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              {/* Admin Routes */}
              <Route 
                path="/admin/" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']} />
                }
              >
                <Route element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="buildings" element={<AdminBuildings />} />
                  <Route path="flats" element={<AdminFlats />} />
                  <Route path="residents" element={<AdminResidents />} />
                  <Route path="allocation-requests" element={<AdminAllocationRequests />} />
                  <Route path="notices" element={<AdminNotices />} />
                  <Route path="maintenance" element={<AdminMaintenance />} />
                </Route>
              </Route>

              {/* Resident Routes */}
              <Route 
                path="/resident/" 
                element={
                  <ProtectedRoute allowedRoles={['RESIDENT']} />
                }
              >
                <Route element={<ResidentLayout />}>
                  <Route path="dashboard" element={<ResidentDashboard />} />
                  <Route path="flat" element={<ResidentFlat />} />
                  <Route path="family-members" element={<ResidentFamilyMembers />} />
                  <Route path="complaints" element={<ResidentComplaints />} />
                  <Route path="request-allocation" element={<FlatAllocationRequestForm />} />
                  {/* Other resident routes will be implemented later */}
                </Route>
              </Route>

              {/* Guard Routes */}
              <Route 
                path="/guard/" 
                element={
                  <ProtectedRoute allowedRoles={['GUARD']} />
                }
              >
                <Route element={<GuardLayout />}>
                  <Route path="dashboard" element={<GuardDashboard />} />
                  <Route path="visitors/new" element={<VisitorForm />} />
                  {/* Other guard routes will be implemented later */}
                </Route>
              </Route>

              {/* Redirect to dashboard based on role */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT', 'GUARD']} />
                }
              >
                <Route 
                  index 
                  element={
                    <Navigate to="/login" replace />
                  } 
                />
              </Route>

              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            
            <ToastContainer 
              position="top-right" 
              autoClose={5000} 
              theme="colored"
              className="dark:text-gray-200"
            />
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;