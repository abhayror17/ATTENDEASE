import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Mail, Phone, ChevronLeft, ChevronRight, Edit2, Trash2, Link2 } from 'lucide-react';
import { employeeApi, departmentApi } from '../api';
import Modal from '../components/Modal';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkingEmployee, setLinkingEmployee] = useState(null);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkError, setLinkError] = useState(null);
  const [linkSuccess, setLinkSuccess] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sample employee data for demo when API is unavailable
  const sampleEmployees = [
    { id: 1, employee_id: 'EMP001', first_name: 'Sarah', last_name: 'Johnson', full_name: 'Sarah Johnson', email: 'sarah.johnson@company.com', phone: '+1 (555) 123-4567', department_name: 'Engineering', position: 'Senior Developer', status: 'active', hire_date: '2022-03-15' },
    { id: 2, employee_id: 'EMP002', first_name: 'Michael', last_name: 'Chen', full_name: 'Michael Chen', email: 'michael.chen@company.com', phone: '+1 (555) 234-5678', department_name: 'Design', position: 'UI/UX Designer', status: 'active', hire_date: '2021-07-22' },
    { id: 3, employee_id: 'EMP003', first_name: 'Emily', last_name: 'Davis', full_name: 'Emily Davis', email: 'emily.davis@company.com', phone: '+1 (555) 345-6789', department_name: 'Marketing', position: 'Marketing Manager', status: 'on_leave', hire_date: '2020-11-10' },
    { id: 4, employee_id: 'EMP004', first_name: 'James', last_name: 'Wilson', full_name: 'James Wilson', email: 'james.wilson@company.com', phone: '+1 (555) 456-7890', department_name: 'Sales', position: 'Sales Representative', status: 'active', hire_date: '2023-01-05' },
    { id: 5, employee_id: 'EMP005', first_name: 'Olivia', last_name: 'Brown', full_name: 'Olivia Brown', email: 'olivia.brown@company.com', phone: '+1 (555) 567-8901', department_name: 'Human Resources', position: 'HR Specialist', status: 'active', hire_date: '2022-09-18' },
    { id: 6, employee_id: 'EMP006', first_name: 'Daniel', last_name: 'Martinez', full_name: 'Daniel Martinez', email: 'daniel.martinez@company.com', phone: '+1 (555) 678-9012', department_name: 'Engineering', position: 'DevOps Engineer', status: 'on_leave', hire_date: '2021-04-30' },
    { id: 7, employee_id: 'EMP007', first_name: 'Sophia', last_name: 'Anderson', full_name: 'Sophia Anderson', email: 'sophia.anderson@company.com', phone: '+1 (555) 789-0123', department_name: 'Finance', position: 'Financial Analyst', status: 'active', hire_date: '2022-06-12' },
    { id: 8, employee_id: 'EMP008', first_name: 'William', last_name: 'Taylor', full_name: 'William Taylor', email: 'william.taylor@company.com', phone: '+1 (555) 890-1234', department_name: 'Engineering', position: 'Backend Developer', status: 'active', hire_date: '2023-02-28' },
    { id: 9, employee_id: 'EMP009', first_name: 'Ava', last_name: 'Thomas', full_name: 'Ava Thomas', email: 'ava.thomas@company.com', phone: '+1 (555) 901-2345', department_name: 'Design', position: 'Graphic Designer', status: 'active', hire_date: '2022-08-05' },
    { id: 10, employee_id: 'EMP010', first_name: 'Benjamin', last_name: 'Garcia', full_name: 'Benjamin Garcia', email: 'benjamin.garcia@company.com', phone: '+1 (555) 012-3456', department_name: 'Sales', position: 'Sales Manager', status: 'on_leave', hire_date: '2020-12-01' },
    { id: 11, employee_id: 'EMP011', first_name: 'Isabella', last_name: 'Rodriguez', full_name: 'Isabella Rodriguez', email: 'isabella.rodriguez@company.com', phone: '+1 (555) 111-2222', department_name: 'Marketing', position: 'Content Strategist', status: 'active', hire_date: '2023-03-15' },
    { id: 12, employee_id: 'EMP012', first_name: 'Alexander', last_name: 'Lee', full_name: 'Alexander Lee', email: 'alexander.lee@company.com', phone: '+1 (555) 333-4444', department_name: 'Engineering', position: 'Full Stack Developer', status: 'active', hire_date: '2022-01-20' },
  ];

  const sampleDepartments = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Sales' },
    { id: 5, name: 'Human Resources' },
    { id: 6, name: 'Finance' },
  ];

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [search, statusFilter, departmentFilter]);

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.department = departmentFilter;
      const response = await employeeApi.getAll(params);
      setEmployees(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Use sample data when API is unavailable
      setEmployees(sampleEmployees);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Use sample data when API is unavailable
      setDepartments(sampleDepartments);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !search ||
      emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.position?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || emp.status === statusFilter;
    const matchesDepartment = !departmentFilter || emp.department == departmentFilter || emp.department_name === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeApi.delete(id);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleEdit = (employee) => {
    navigate(`/employees/edit/${employee.id}`);
  };

  const handleOpenLinkModal = (employee) => {
    setLinkingEmployee(employee);
    setLinkEmail('');
    setLinkError(null);
    setLinkSuccess(null);
    setIsLinkModalOpen(true);
  };

  const handleLinkUser = async (e) => {
    e.preventDefault();
    if (!linkEmail) {
      setLinkError('Please enter a user email');
      return;
    }
    
    setLinkError(null);
    setLinkSuccess(null);
    
    try {
      const response = await employeeApi.linkUser(linkingEmployee.id, linkEmail);
      setLinkSuccess(response.data.message);
      fetchEmployees();
      setTimeout(() => {
        setIsLinkModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Error linking user:', error);
      setLinkError(error.response?.data?.error || 'Failed to link user');
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--primary)';
      case 'on_leave': return 'var(--warning)';
      case 'inactive': return 'var(--danger)';
      default: return 'var(--text-dim)';
    }
  };

  const getDepartmentColor = (department) => {
    return { border: '1px solid var(--border)', color: 'var(--text-dim)' };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="employee-directory">
      {/* Page Header */}
      <div className="directory-header">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-subtitle">Manage and view all employee records</p>
        </div>
      </div>

      {/* Top Bar with Search, Filters, and Add Button */}
      <div className="directory-toolbar">
        <div className="toolbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, role, or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="toolbar-input"
          />
        </div>

        <div className="toolbar-filters">
          <select
            className="toolbar-select"
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Departments</option>
            {(departments.length > 0 ? departments : sampleDepartments).map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          <select
            className="toolbar-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="btn-add-employee" onClick={() => navigate('/employees/add')}>
            <Plus size={18} />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="employee-grid">
        {paginatedEmployees.length > 0 ? (
          paginatedEmployees.map((employee) => (
            <div key={employee.id} className="employee-card">
              {/* Card Actions */}
              <div className="card-actions">
                <button
                  className="card-action-btn link"
                  onClick={() => handleOpenLinkModal(employee)}
                  title="Link User"
                >
                  <Link2 size={14} />
                </button>
                <button
                  className="card-action-btn edit"
                  onClick={() => handleEdit(employee)}
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="card-action-btn delete"
                  onClick={() => handleDelete(employee.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Profile Image with Status Indicator */}
              <div className="card-avatar-container">
                <div className="card-avatar">
                  {employee.first_name?.charAt(0) || 'U'}
                </div>
                <span
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(employee.status) }}
                />
              </div>

              {/* Employee Info */}
              <h3 className="card-name">{employee.full_name}</h3>
              <p className="card-title">{employee.position || 'No Position'}</p>

              {/* Badges */}
              <div className="card-badges">
                <span
                  className="badge-dept"
                  style={getDepartmentColor(employee.department_name)}
                >
                  {employee.department_name || 'No Dept'}
                </span>
                <span
                  className="badge-status"
                  style={{
                    backgroundColor: `${getStatusColor(employee.status)}20`,
                    color: getStatusColor(employee.status)
                  }}
                >
                  {employee.status === 'on_leave' ? 'On Leave' : employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="card-buttons">
                <a href={`mailto:${employee.email}`} className="card-btn email">
                  <Mail size={16} />
                  <span>Email</span>
                </a>
                <a href={`tel:${employee.phone}`} className="card-btn call">
                  <Phone size={16} />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No employees found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} />
          </button>

          <span className="pagination-info">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length}
          </span>
        </div>
      )}

      {/* Link User Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Link User Account"
      >
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Linking employee: <strong>{linkingEmployee?.full_name}</strong> ({linkingEmployee?.employee_id})
          </p>
          {linkingEmployee?.linked_user_email && (
            <p style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
              Currently linked to: {linkingEmployee.linked_user_email}
            </p>
          )}
        </div>
        
        <form onSubmit={handleLinkUser}>
          <div className="form-group">
            <label className="form-label">User Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter user email address"
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
            />
          </div>
          
          {linkError && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius)',
              color: '#ef4444',
              marginBottom: '16px',
              fontSize: '0.9rem'
            }}>
              {linkError}
            </div>
          )}
          
          {linkSuccess && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius)',
              color: '#10b981',
              marginBottom: '16px',
              fontSize: '0.9rem'
            }}>
              {linkSuccess}
            </div>
          )}
          
          <div className="modal-footer" style={{ padding: '0', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsLinkModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Link User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;