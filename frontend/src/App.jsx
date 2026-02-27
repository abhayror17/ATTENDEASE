import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, Clock } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Attendance from './pages/Attendance';
import Departments from './pages/Departments';
import CheckIn from './pages/CheckIn';
import LeaveRequests from './pages/LeaveRequests';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.is_admin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <div className="app">
      <header className="mobile-header">
        <button 
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="mobile-logo">
          <div className="logo-icon">
            <Clock size={20} />
          </div>
          <span className="logo-text">AttendEase</span>
        </div>
        <div style={{ width: 44 }} />
      </header>
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} user={user} />
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <AdminRoute>
              <AppLayout>
                <Employees />
              </AppLayout>
            </AdminRoute>
          } />
          <Route path="/employees/add" element={
            <AdminRoute>
              <AppLayout>
                <AddEmployee />
              </AppLayout>
            </AdminRoute>
          } />
          <Route path="/employees/edit/:id" element={
            <AdminRoute>
              <AppLayout>
                <EditEmployee />
              </AppLayout>
            </AdminRoute>
          } />
          <Route path="/attendance" element={
            <AdminRoute>
              <AppLayout>
                <Attendance />
              </AppLayout>
            </AdminRoute>
          } />
          <Route path="/departments" element={
            <AdminRoute>
              <AppLayout>
                <Departments />
              </AppLayout>
            </AdminRoute>
          } />
          <Route path="/check-in" element={
            <ProtectedRoute>
              <AppLayout>
                <CheckIn />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/leave-requests" element={
            <ProtectedRoute>
              <AppLayout>
                <LeaveRequests />
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;