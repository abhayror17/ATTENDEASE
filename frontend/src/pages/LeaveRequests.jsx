import { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X, Clock, FileText, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { leaveRequestApi, employeeApi } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const LeaveRequests = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isAdmin = user?.is_admin || user?.role === 'admin';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    employee: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchData();
  }, [statusFilter, leaveTypeFilter]);

  const fetchData = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (leaveTypeFilter) params.leave_type = leaveTypeFilter;
      
      const response = await leaveRequestApi.getAll(params);
      setLeaveRequests(response.data.results || response.data);
      
      if (isAdmin) {
        const empRes = await employeeApi.getActive();
        setEmployees(empRes.data.results || empRes.data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const data = { ...formData };
      if (!isAdmin) {
        delete data.employee;
      }
      
      await leaveRequestApi.create(data);
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating leave request:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Failed to submit leave request';
      
      if (typeof errorData === 'object' && errorData !== null) {
        const fieldErrors = Object.entries(errorData)
          .map(([field, messages]) => {
            const fieldName = field.replace(/_/g, ' ');
            const message = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${fieldName}: ${message}`;
          })
          .join('\n');
        errorMessage = fieldErrors || errorMessage;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async () => {
    if (!reviewingRequest) return;
    
    setIsSubmitting(true);
    try {
      if (reviewAction === 'approve') {
        await leaveRequestApi.approve(reviewingRequest.id, adminComment);
      } else {
        await leaveRequestApi.reject(reviewingRequest.id, adminComment);
      }
      setIsReviewModalOpen(false);
      setReviewingRequest(null);
      setAdminComment('');
      fetchData();
    } catch (error) {
      console.error('Error reviewing leave request:', error);
      alert('Failed to update leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = (request, action) => {
    setReviewingRequest(request);
    setReviewAction(action);
    setAdminComment('');
    setIsReviewModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      leave_type: 'annual',
      start_date: '',
      end_date: '',
      reason: '',
    });
    setSubmitError('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'var(--success)';
      case 'rejected': return 'var(--danger)';
      case 'pending': return 'var(--warning)';
      default: return 'var(--text-dim)';
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' },
      approved: { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' },
      rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' },
    };
    const config = colors[status] || colors.pending;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        textTransform: 'capitalize',
      }}>
        {status}
      </span>
    );
  };

  const getLeaveTypeLabel = (type) => {
    const found = leaveTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const totalPages = Math.ceil(leaveRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = leaveRequests.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAdmin && !user?.employee_id) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Leave Requests</h1>
            <p className="page-subtitle">Submit and track your leave requests</p>
          </div>
        </div>
        <div className="card empty-state">
          <FileText size={48} />
          <h3>No Employee Profile Linked</h3>
          <p>Your account is not linked to an employee profile. Please contact the administrator to set up your employee record before you can submit leave requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Requests</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Manage employee leave requests' : 'Submit and track your leave requests'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setIsModalOpen(true); resetForm(); }}>
          <Plus size={18} />
          New Request
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="form-select"
            value={leaveTypeFilter}
            onChange={(e) => { setLeaveTypeFilter(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Types</option>
            {leaveTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            {leaveRequests.length} request{leaveRequests.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {paginatedRequests.length > 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="entity-info">
                        <div className="entity-avatar">
                          {request.employee_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="entity-name">{request.employee_name}</div>
                          <div className="entity-id">{request.employee_id} {request.department_name && `• ${request.department_name}`}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getLeaveTypeLabel(request.leave_type)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: 'var(--text-dim)' }} />
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: 'var(--primary-glow)',
                        color: 'var(--primary)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600,
                      }}>
                        {request.days_count}
                      </span>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.reason}
                      </div>
                    </td>
                    <td>{getStatusBadge(request.status)}</td>
                    {isAdmin && (
                      <td>
                        {request.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '6px 10px' }}
                              onClick={() => openReviewModal(request, 'approve')}
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '6px 10px' }}
                              onClick={() => openReviewModal(request, 'reject')}
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            {request.reviewed_by_name && `By ${request.reviewed_by_name}`}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ 
              padding: '16px', 
              borderTop: '1px solid var(--border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '16px' 
            }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: 'var(--text-dim)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card empty-state">
          <FileText size={48} />
          <h3>No Leave Requests</h3>
          <p>{statusFilter || leaveTypeFilter ? 'No requests match your filters.' : 'Submit your first leave request to get started.'}</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title="New Leave Request"
      >
        <form onSubmit={handleSubmit}>
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">Employee</label>
              <select
                className="form-select"
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select
              className="form-select"
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              required
            >
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea
              className="form-textarea"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave request..."
              rows={4}
              required
            />
          </div>

          {submitError && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius)',
              color: '#ef4444',
              marginBottom: '16px',
            }}>
              {submitError}
            </div>
          )}

          <div className="modal-footer" style={{ padding: 0, marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => { setIsReviewModalOpen(false); setReviewingRequest(null); }}
        title={reviewAction === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
      >
        {reviewingRequest && (
          <>
            <div style={{ 
              background: 'var(--bg)', 
              padding: '16px', 
              borderRadius: 'var(--radius)', 
              marginBottom: '16px' 
            }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{reviewingRequest.employee_name}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                {getLeaveTypeLabel(reviewingRequest.leave_type)} • {reviewingRequest.days_count} day(s)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Calendar size={14} />
                {formatDate(reviewingRequest.start_date)} - {formatDate(reviewingRequest.end_date)}
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                <strong>Reason:</strong> {reviewingRequest.reason}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Comment (Optional)</label>
              <textarea
                className="form-textarea"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
            </div>

            <div style={{
              padding: '12px 16px',
              background: reviewAction === 'approve' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {reviewAction === 'approve' ? (
                <>
                  <Check size={18} style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--success)' }}>This request will be approved</span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
                  <span style={{ color: 'var(--danger)' }}>This request will be rejected</span>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ padding: 0, marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setIsReviewModalOpen(false); setReviewingRequest(null); }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  background: reviewAction === 'approve' ? 'var(--success)' : 'var(--danger)',
                  color: 'white',
                }}
                onClick={handleReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default LeaveRequests;
