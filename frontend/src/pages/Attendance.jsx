import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Save, X, Search } from 'lucide-react';
import { attendanceApi, departmentApi } from '../api';

const Attendance = () => {
  const [dailySummary, setDailySummary] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchDailySummary();
    fetchDepartments();
  }, [selectedDate, statusFilter, departmentFilter]);

  const fetchDailySummary = async () => {
    setLoading(true);
    try {
      const params = { date: selectedDate };
      if (departmentFilter) params.department = departmentFilter;
      if (statusFilter) params.status = statusFilter;
      const response = await attendanceApi.getDailySummary(params);
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      setDailySummary([]);
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
    }
  };

  const filteredSummary = dailySummary.filter(record => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      record.employee_name?.toLowerCase().includes(searchLower) ||
      record.employee_id_code?.toLowerCase().includes(searchLower) ||
      record.first_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (record) => {
    setEditingRecord(record.employee_id);
    setEditFormData({
      check_in: record.check_in || '',
      check_out: record.check_out || '',
      status: record.status === 'not_checked_in' ? 'present' : record.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditFormData({});
  };

  const handleSave = async (record) => {
    try {
      const data = {
        employee: record.employee_id,
        date: selectedDate,
        check_in: editFormData.check_in || null,
        check_out: editFormData.check_out || null,
        status: editFormData.status,
      };

      if (record.attendance_id) {
        await attendanceApi.update(record.attendance_id, data);
      } else {
        await attendanceApi.create(data);
      }

      setEditingRecord(null);
      setEditFormData({});
      fetchDailySummary();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance record');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      present: { class: 'badge-success', label: 'Present' },
      absent: { class: 'badge-danger', label: 'Absent' },
      late: { class: 'badge-warning', label: 'Late' },
      on_leave: { class: 'badge-info', label: 'On Leave' },
      half_day: { class: 'badge-default', label: 'Half Day' },
      not_checked_in: { class: 'badge-default', label: 'Not Checked In' },
    };
    const config = statusMap[status] || statusMap.not_checked_in;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const formatTime = (time) => {
    if (!time) return '-';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const formatWorkingHours = (hours) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const navigateDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const totalPages = Math.ceil(filteredSummary.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredSummary.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: filteredSummary.length,
    present: filteredSummary.filter(r => r.status === 'present').length,
    absent: filteredSummary.filter(r => r.status === 'absent').length,
    late: filteredSummary.filter(r => r.status === 'late').length,
    onLeave: filteredSummary.filter(r => r.status === 'on_leave').length,
    notCheckedIn: filteredSummary.filter(r => r.status === 'not_checked_in').length,
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track and manage employee attendance</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.notCheckedIn}</div>
          <div className="stat-label">Not Checked In</div>
        </div>
      </div>

      <div className="directory-toolbar">
        <div className="toolbar-filters">
          <button className="btn btn-secondary" onClick={() => navigateDate(-1)} style={{ padding: '10px' }}>
            <ChevronLeft size={20} />
          </button>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={() => navigateDate(1)} style={{ padding: '10px' }}>
            <ChevronRight size={20} />
          </button>
          <button className="btn btn-secondary" onClick={goToToday}>
            Today
          </button>
        </div>

        <div className="toolbar-filters" style={{ flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
          <div className="toolbar-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="toolbar-input"
            />
          </div>
          <select
            className="toolbar-select"
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Depts</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Overview - {new Date(selectedDate).toLocaleDateString()}
          </h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((record) => (
                  <tr key={record.employee_id}>
                    <td>
                      <div className="entity-info">
                        <div className="entity-avatar">
                          {record.first_name?.charAt(0) || record.employee_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="entity-name">{record.first_name ? `${record.first_name} ${record.last_name || ''}` : record.employee_name}</div>
                          <div className="entity-id">{record.employee_id_code}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {editingRecord === record.employee_id ? (
                        <input
                          type="time"
                          className="form-input"
                          style={{ width: 'auto', padding: '4px 8px' }}
                          value={editFormData.check_in}
                          onChange={(e) => setEditFormData({ ...editFormData, check_in: e.target.value })}
                        />
                      ) : (
                        formatTime(record.check_in)
                      )}
                    </td>
                    <td>
                      {editingRecord === record.employee_id ? (
                        <input
                          type="time"
                          className="form-input"
                          style={{ width: 'auto', padding: '4px 8px' }}
                          value={editFormData.check_out}
                          onChange={(e) => setEditFormData({ ...editFormData, check_out: e.target.value })}
                        />
                      ) : (
                        formatTime(record.check_out)
                      )}
                    </td>
                    <td>{formatWorkingHours(record.working_hours)}</td>
                    <td>
                      {editingRecord === record.employee_id ? (
                        <select
                          className="form-select"
                          style={{ width: 'auto', padding: '4px 8px' }}
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="on_leave">On Leave</option>
                          <option value="half_day">Half Day</option>
                        </select>
                      ) : (
                        getStatusBadge(record.status)
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {editingRecord === record.employee_id ? (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => handleSave(record)} style={{ padding: '6px' }} title="Save">
                              <Save size={14} />
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit} style={{ padding: '6px' }} title="Cancel">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(record)} style={{ padding: '6px' }} title="Edit">
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    No records found for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
