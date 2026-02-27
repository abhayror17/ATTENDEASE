import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Users } from 'lucide-react';
import { departmentApi } from '../api';
import Modal from '../components/Modal';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await departmentApi.update(editingDepartment.id, formData);
      } else {
        await departmentApi.create(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentApi.delete(id);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingDepartment(null);
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
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Manage organizational departments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Add Department
        </button>
      </div>

      <div className="stats-grid">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept.id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="stat-icon-wrapper">
                    <Building2 />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>
                      {dept.name}
                    </h3>
                  </div>
                </div>
                <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(dept)}
                    title="Edit Department"
                    style={{ padding: '8px' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(dept.id)}
                    title="Delete Department"
                    style={{ padding: '8px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p style={{ color: 'var(--text-dim)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {dept.description || 'No description provided'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <Users size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {dept.employee_count || 0} Employees
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px' }}>
            <div className="stat-icon-wrapper" style={{ margin: '0 auto 16px' }}>
              <Building2 />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Departments Found</h3>
            <p style={{ color: 'var(--text-dim)' }}>Get started by adding a new department.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingDepartment ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Enter department description..."
            />
          </div>

          <div className="modal-footer" style={{ padding: '0', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDepartment ? 'Update' : 'Create'} Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
