import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Calendar, MapPin, Briefcase, Building } from 'lucide-react';
import { employeeApi, departmentApi } from '../api';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    department_id: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
    address: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.hire_date) {
      errors.hire_date = 'Hire date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const cleanData = {
      ...formData,
      department_id: formData.department_id || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      phone: formData.phone || null,
    };

    try {
      const response = await employeeApi.create(cleanData);
      setSuccess(`Employee "${response.data.full_name}" created successfully with ID: ${response.data.employee_id}`);
      
      // Reset form after successful creation
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        department_id: '',
        position: '',
        hire_date: new Date().toISOString().split('T')[0],
        status: 'active',
        address: '',
      });

      // Navigate back to employees list after 2 seconds
      setTimeout(() => {
        navigate('/employees');
      }, 2000);
    } catch (error) {
      console.error('Error creating employee:', error);
      
      let errorMessage = 'Failed to create employee. ';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = field.replace(/_/g, ' ');
              const message = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${fieldName}: ${message}`;
            })
            .join('\n');
          errorMessage += fieldErrors;
        } else {
          errorMessage += errorData;
        }
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/employees')}>
          <ArrowLeft size={20} />
          <span>Back to Employees</span>
        </button>
        <div className="header-content">
          <h1 className="page-title">Add New Employee</h1>
          <p className="page-subtitle">Fill in the details to add a new employee to the system</p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="employee-form">
        {/* Error/Success Messages */}
        {error && (
          <div className="alert alert-error">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{error}</pre>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Personal Information Section */}
        <div className="form-section">
          <div className="section-header">
            <User size={20} />
            <h2>Personal Information</h2>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className={`form-input ${formErrors.first_name ? 'error' : ''}`}
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
              />
              {formErrors.first_name && (
                <span className="field-error">{formErrors.first_name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="last_name">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className={`form-input ${formErrors.last_name ? 'error' : ''}`}
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
              />
              {formErrors.last_name && (
                <span className="field-error">{formErrors.last_name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="employee@company.com"
                />
              </div>
              {formErrors.email && (
                <span className="field-error">{formErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>
              <span className="field-hint">Format: +1234567890 (with country code)</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date_of_birth">
                Date of Birth
              </label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  className="form-input"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="address">
                Address
              </label>
              <div className="input-with-icon textarea-icon">
                <MapPin size={18} className="input-icon" />
                <textarea
                  id="address"
                  name="address"
                  className="form-textarea"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  rows="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details Section */}
        <div className="form-section">
          <div className="section-header">
            <Briefcase size={20} />
            <h2>Employment Details</h2>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="department_id">
                Department
              </label>
              <div className="input-with-icon">
                <Building size={18} className="input-icon" />
                <select
                  id="department_id"
                  name="department_id"
                  className="form-select"
                  value={formData.department_id}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="position">
                Position / Job Title
              </label>
              <input
                type="text"
                id="position"
                name="position"
                className="form-input"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hire_date">
                Hire Date <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  className={`form-input ${formErrors.hire_date ? 'error' : ''}`}
                  value={formData.hire_date}
                  onChange={handleChange}
                />
              </div>
              {formErrors.hire_date && (
                <span className="field-error">{formErrors.hire_date}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Employment Status
              </label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/employees')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Create Employee</span>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .page-container {
          padding: 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          padding: 8px 0;
          margin-bottom: 16px;
          transition: color 0.2s;
        }

        .back-btn:hover {
          color: var(--primary);
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0;
        }

        .employee-form {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
        }

        .alert {
          padding: 16px;
          border-radius: var(--radius);
          margin-bottom: 24px;
          font-size: 14px;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .form-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .form-section:last-of-type {
          border-bottom: none;
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          color: var(--primary);
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .required {
          color: #ef4444;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 15px;
          background: rgba(10, 10, 10, 0.9);
          color: var(--text-primary);
          transition: all 0.2s ease;
          width: 100%;
          min-height: 48px;
        }

        .form-select {
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          padding-right: 44px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2300ff00' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }

        .form-select option {
          background: #0a0a0a;
          color: #ffffff;
          padding: 12px;
        }

        input[type="date"] {
          appearance: none;
          -webkit-appearance: none;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2300ff00' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          cursor: pointer;
          opacity: 1;
          width: 26px;
          height: 26px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          background-color: rgba(0, 255, 0, 0.15);
        }

        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field,
        input[type="date"]::-webkit-datetime-edit-year-field {
          color: var(--text-primary);
        }

        .form-input:hover,
        .form-select:hover,
        .form-textarea:hover {
          border-color: rgba(255, 255, 255, 0.4);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 255, 0, 0.15);
        }

        .form-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon .input-icon {
          position: absolute;
          left: 14px;
          color: var(--primary);
          pointer-events: none;
          z-index: 1;
        }

        .input-with-icon .form-input,
        .input-with-icon .form-select {
          padding-left: 42px;
        }

        .input-with-icon input[type="date"] {
          padding-left: 42px;
          padding-right: 44px;
        }

        .input-with-icon .form-select {
          padding-left: 42px;
          padding-right: 44px;
        }

        .input-with-icon.textarea-icon {
          align-items: flex-start;
        }

        .input-with-icon.textarea-icon .input-icon {
          top: 14px;
        }

        .field-error {
          font-size: 12px;
          color: #ef4444;
        }

        .field-hint {
          font-size: 12px;
          color: var(--text-dim);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .employee-form {
            padding: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
          }

          .form-input,
          .form-select,
          .form-textarea {
            font-size: 16px;
            min-height: 52px;
            padding: 14px 16px;
          }

          .form-select {
            background-size: 20px;
            padding-right: 48px;
          }

          input[type="date"]::-webkit-calendar-picker-indicator {
            width: 28px;
            height: 28px;
            background-size: 20px;
          }

          .input-with-icon .form-input,
          .input-with-icon .form-select,
          .input-with-icon input[type="date"] {
            padding-left: 44px;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .form-input,
          .form-select,
          .form-textarea {
            min-height: 54px;
          }

          .form-select option {
            padding: 16px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AddEmployee;
