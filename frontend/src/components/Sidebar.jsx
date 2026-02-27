import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  Clock,
  UserCheck,
  X,
  LogOut,
  User,
  FileText
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, onLogout, user }) => {
  const isAdmin = user?.is_admin || user?.role === 'admin';

  const baseNavItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/check-in', icon: UserCheck, label: 'Check In/Out' },
    { path: '/leave-requests', icon: FileText, label: 'Leave Requests' },
  ];

  const adminNavItems = [
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/departments', icon: Building2, label: 'Departments' },
  ];

  const navItems = isAdmin 
    ? [...baseNavItems.slice(0, 1), ...adminNavItems, ...baseNavItems.slice(1)] 
    : baseNavItems;

  const handleNavClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    handleNavClick();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-logo" onClick={handleNavClick}>
            <div className="logo-icon">
              <Clock />
            </div>
            <span className="logo-text">AttendEase</span>
          </NavLink>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.first_name || user?.username || 'User'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;