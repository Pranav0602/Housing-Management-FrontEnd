import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';

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

// Resident Pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import FlatAllocationRequestForm from './pages/resident/FlatAllocationRequestForm';

// Guard Pages
import GuardDashboard from './pages/guard/GuardDashboard';
import VisitorForm from './pages/guard/VisitorForm';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
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
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} />
              }
            >
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                {/* Other admin routes will be implemented later */}
              </Route>
            </Route>

            {/* Resident Routes */}
            <Route 
              path="/resident" 
              element={
                <ProtectedRoute allowedRoles={['RESIDENT']} />
              }
            >
              <Route element={<ResidentLayout />}>
                <Route path="dashboard" element={<ResidentDashboard />} />
                <Route path="request-allocation" element={<FlatAllocationRequestForm />} />
                {/* Other resident routes will be implemented later */}
              </Route>
            </Route>

            {/* Guard Routes */}
            <Route 
              path="/guard" 
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
          
          <ToastContainer position="top-right" autoClose={5000} />
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;