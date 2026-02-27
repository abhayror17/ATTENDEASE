import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Check, Search, Calendar } from 'lucide-react';
import { attendanceApi, employeeApi } from '../api';
import { useAuth } from '../context/AuthContext';

const CheckIn = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const isAdmin = user?.is_admin || user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, attRes] = await Promise.all([
        employeeApi.getActive(),
        attendanceApi.getToday(),
      ]);
      setEmployees(empRes.data.results || empRes.data);
      setTodayAttendance(attRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceRecord = (employeeId) => {
    return todayAttendance.find((a) => a.employee_id === employeeId);
  };

  const handleCheckIn = async (employeeId) => {
    setProcessingId(employeeId);
    try {
      await attendanceApi.checkIn(employeeId);
      await fetchData();
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Failed to check in. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckOut = async (employeeId) => {
    setProcessingId(employeeId);
    try {
      await attendanceApi.checkOut(employeeId);
      await fetchData();
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Failed to check out. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      present: { bg: 'rgba(0, 255, 0, 0.1)', color: 'var(--success)', label: 'Present' },
      absent: { bg: 'rgba(255, 68, 68, 0.1)', color: 'var(--danger)', label: 'Absent' },
      late: { bg: 'rgba(255, 170, 0, 0.1)', color: 'var(--warning)', label: 'Late' },
      on_leave: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'On Leave' },
      half_day: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', label: 'Half Day' },
    };
    const config = statusMap[status] || statusMap.present;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {config.label}
      </span>
    );
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  let filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin && user?.employee_id) {
    filteredEmployees = filteredEmployees.filter((emp) => emp.id === user.employee_id);
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAdmin && !user?.employee_id) {
    return (
      <div className="checkin-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Check In / Out</h1>
            <p className="page-subtitle">Mark your daily attendance</p>
          </div>
        </div>
        <div className="card empty-state">
          <UserCheck size={48} />
          <h3>No Employee Profile Linked</h3>
          <p>Your account is not linked to an employee profile. Please contact the administrator to set up your employee record.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Check In / Out</h1>
          <p className="page-subtitle">
            {!isAdmin ? 'Mark your daily attendance' : 'Manage employee attendance'}
          </p>
        </div>
        <div className="date-display">
          <Calendar size={18} />
          <span>{getTodayDate()}</span>
        </div>
      </div>

      {isAdmin && (
        <div className="checkin-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search employees by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {!isAdmin ? (
        filteredEmployees.map((employee) => {
          const record = getAttendanceRecord(employee.id);
          const isCheckedIn = record && record.check_in;
          const isCheckedOut = record && record.check_out;
          const isProcessing = processingId === employee.id;

          return (
            <div key={employee.id} className="checkin-hero-card">
              <div className="checkin-hero-header">
                <div className="checkin-hero-avatar">
                  {employee.first_name?.charAt(0) || 'U'}
                </div>
                <div className="checkin-hero-info">
                  <h2>{employee.full_name}</h2>
                  <p>{employee.employee_id} • {employee.position || 'No Position'}</p>
                  {employee.department_name && (
                    <span className="checkin-dept-badge">{employee.department_name}</span>
                  )}
                </div>
              </div>

              <div className="checkin-hero-times">
                <div className="checkin-time-block">
                  <div className="checkin-time-label">
                    <Clock size={14} />
                    Check In
                  </div>
                  <div className={`checkin-time-value ${record?.check_in ? 'active' : ''}`}>
                    {formatTime(record?.check_in)}
                  </div>
                </div>
                <div className="checkin-time-divider"></div>
                <div className="checkin-time-block">
                  <div className="checkin-time-label">
                    <Clock size={14} />
                    Check Out
                  </div>
                  <div className={`checkin-time-value ${record?.check_out ? 'active' : ''}`}>
                    {formatTime(record?.check_out)}
                  </div>
                </div>
                {record?.working_hours && (
                  <div className="checkin-time-divider"></div>
                )}
                {record?.working_hours && (
                  <div className="checkin-time-block">
                    <div className="checkin-time-label">Working Hours</div>
                    <div className="checkin-time-value active">{record.working_hours}h</div>
                  </div>
                )}
              </div>

              <div className="checkin-hero-action">
                {!isCheckedIn ? (
                  <button
                    className="checkin-btn checkin-btn-primary"
                    onClick={() => handleCheckIn(employee.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    ) : (
                      <>
                        <UserCheck size={20} />
                        Check In Now
                      </>
                    )}
                  </button>
                ) : !isCheckedOut ? (
                  <button
                    className="checkin-btn checkin-btn-danger"
                    onClick={() => handleCheckOut(employee.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    ) : (
                      <>
                        <UserX size={20} />
                        Check Out
                      </>
                    )}
                  </button>
                ) : (
                  <div className="checkin-completed">
                    <Check size={20} />
                    <span>Completed for Today</span>
                  </div>
                )}
              </div>

              {record && (
                <div className="checkin-hero-status">
                  {getStatusBadge(record.status)}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="checkin-grid">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => {
              const record = getAttendanceRecord(employee.id);
              const isCheckedIn = record && record.check_in;
              const isCheckedOut = record && record.check_out;
              const isProcessing = processingId === employee.id;

              return (
                <div key={employee.id} className="checkin-card">
                  <div className="checkin-card-header">
                    <div className="checkin-card-avatar">
                      {employee.first_name?.charAt(0) || 'U'}
                    </div>
                    <div className="checkin-card-info">
                      <h3>{employee.full_name}</h3>
                      <p>{employee.employee_id}</p>
                    </div>
                    {record && getStatusBadge(record.status)}
                  </div>

                  <div className="checkin-card-times">
                    <div className="checkin-card-time">
                      <span className="label">In</span>
                      <span className={`value ${record?.check_in ? 'active' : ''}`}>
                        {formatTime(record?.check_in)}
                      </span>
                    </div>
                    <div className="checkin-card-time">
                      <span className="label">Out</span>
                      <span className={`value ${record?.check_out ? 'active' : ''}`}>
                        {formatTime(record?.check_out)}
                      </span>
                    </div>
                  </div>

                  <div className="checkin-card-action">
                    {!isCheckedIn ? (
                      <button
                        className="checkin-btn-sm checkin-btn-sm-primary"
                        onClick={() => handleCheckIn(employee.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                        ) : (
                          <>
                            <UserCheck size={16} />
                            Check In
                          </>
                        )}
                      </button>
                    ) : !isCheckedOut ? (
                      <button
                        className="checkin-btn-sm checkin-btn-sm-danger"
                        onClick={() => handleCheckOut(employee.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                        ) : (
                          <>
                            <UserX size={16} />
                            Check Out
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="checkin-card-done">
                        <Check size={16} />
                        Done
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="checkin-empty">
              <UserCheck size={48} />
              <p>No employees found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckIn;
