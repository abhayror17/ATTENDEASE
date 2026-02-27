import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { attendanceApi, departmentApi } from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_employees: 0,
    present: 0,
    absent: 0,
    late: 0,
    on_leave: 0,
    half_day: 0,
    not_checked_in: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [userAttendance, setUserAttendance] = useState([]);
  const [userStats, setUserStats] = useState({
    total_days: 0,
    present: 0,
    absent: 0,
    late: 0,
    on_leave: 0,
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.is_admin || user?.role === 'admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      if (isAdmin) {
        // Fetch 7 days for trend
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 6);
        const fromDateStr = last7Days.toISOString().split('T')[0];

        const [statsRes, summaryRes, trendRes] = await Promise.all([
          attendanceApi.getStats(todayStr),
          attendanceApi.getDailySummary({ date: todayStr }),
          attendanceApi.getAll({ date_from: fromDateStr, date_to: todayStr }),
        ]);

        setStats(statsRes.data);
        setRecentAttendance(summaryRes.data.slice(0, 10));

        // Process weekly trend
        processTrendData(trendRes.data.results || trendRes.data, fromDateStr, todayStr);
      } else if (user?.employee_id) {
        const monthStart = new Date();
        monthStart.setDate(1);
        const fromDate = monthStart.toISOString().split('T')[0];

        const [attRes] = await Promise.all([
          attendanceApi.getAll({ employee: user.employee_id, date_from: fromDate }),
        ]);

        const attendanceData = attRes.data.results || attRes.data;
        setUserAttendance(attendanceData.slice(0, 10));

        const stats = {
          total_days: attendanceData.length,
          present: attendanceData.filter(a => a.status === 'present').length,
          absent: attendanceData.filter(a => a.status === 'absent').length,
          late: attendanceData.filter(a => a.status === 'late').length,
          on_leave: attendanceData.filter(a => a.status === 'on_leave').length,
        };
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTrendData = (data, fromDate, toDate) => {
    const dates = [];
    let curr = new Date(fromDate);
    const end = new Date(toDate);

    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }

    const processed = dates.map(date => {
      const dayData = data.filter(d => d.date === date);
      return {
        date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        present: dayData.filter(d => d.status === 'present' || d.status === 'late').length,
        total: dayData.length
      };
    });
    setWeeklyData(processed);
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const attendanceRate = stats.total_employees > 0
    ? Math.round(((stats.present + stats.late) / stats.total_employees) * 100)
    : 0;

  return (
    <div className="dashboard-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Intelligence</h1>
          <p className="page-subtitle">Real-time attendance analytics and workforce insights</p>
        </div>
        <div className="header-actions">
          <div className="live-indicator">
            <span className="dot"></span>
            Live Feed
          </div>
        </div>
      </div>

      {isAdmin ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.total_employees}</div>
                <div className="stat-label">Total Workforce</div>
              </div>
              <div className="stat-mini-chart">
                <ArrowUpRight size={16} className="text-primary" />
              </div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-icon-wrapper success">
                <UserCheck size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.present + stats.late}</div>
                <div className="stat-label">Active Today</div>
              </div>
              <div className="stat-rate">{attendanceRate}%</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper danger">
                <UserX size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.absent}</div>
                <div className="stat-label">Absenteeism</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper warning">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.late}</div>
                <div className="stat-label">Late Arrivals</div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="card main-chart-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Attendance Trend</h3>
                  <p className="card-subtitle-small">Last 7 processing days activity</p>
                </div>
                <TrendingUp size={20} className="text-dim" />
              </div>
              <div className="trend-chart-container">
                <div className="trend-bars">
                  {weeklyData.map((day, idx) => {
                    const height = day.total > 0 ? (day.present / day.total) * 100 : 5;
                    return (
                      <div key={idx} className="trend-column">
                        <div className="bar-container">
                          <div
                            className="trend-bar"
                            style={{ height: `${height}%` }}
                          >
                            <div className="bar-tooltip">{day.present}/{day.total}</div>
                          </div>
                        </div>
                        <span className="trend-date">{day.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="card compact-card">
              <div className="card-header">
                <h3 className="card-title">Distribution</h3>
              </div>
              <div className="premium-donut">
                <svg viewBox="0 0 100 100" className="donut-svg">
                  <circle cx="50" cy="50" r="42" className="donut-ring" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="donut-segment"
                    style={{
                      stroke: 'var(--primary)',
                      strokeDasharray: `${(stats.present / stats.total_employees) * 263.8} 263.8`,
                    }}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="donut-segment"
                    style={{
                      stroke: 'var(--warning)',
                      strokeDasharray: `${(stats.late / stats.total_employees) * 263.8} 263.8`,
                      strokeDashoffset: `${-(stats.present / stats.total_employees) * 263.8}`,
                    }}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="donut-segment"
                    style={{
                      stroke: 'var(--danger)',
                      strokeDasharray: `${(stats.absent / stats.total_employees) * 263.8} 263.8`,
                      strokeDashoffset: `${-((stats.present + stats.late) / stats.total_employees) * 263.8}`,
                    }}
                  />
                </svg>
                <div className="donut-center">
                  <span className="donut-value">{attendanceRate}%</span>
                  <span className="donut-label">Yield</span>
                </div>
              </div>
              <div className="mini-legend">
                <div className="legend-item"><span className="dot present"></span> Present</div>
                <div className="legend-item"><span className="dot late"></span> Late</div>
                <div className="legend-item"><span className="dot absent"></span> Absent</div>
              </div>
            </div>
          </div>

          <div className="card activity-card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={20} className="text-primary" />
                <h3 className="card-title">Real-time Activity Log</h3>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee Entity</th>
                    <th>Engagement Status</th>
                    <th>Logs (In/Out)</th>
                    <th>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((record) => (
                    <tr key={record.employee_id}>
                      <td>
                        <div className="entity-info">
                          <div className="entity-avatar">
                            {record.first_name?.[0] || record.employee_name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="entity-name">{record.employee_name}</div>
                            <div className="entity-id">{record.employee_id_code}</div>
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>
                        <div className="log-times">
                          <span className="log-in">{formatTime(record.check_in)}</span>
                          <span className="log-divider"></span>
                          <span className="log-out">{formatTime(record.check_out)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="activity-indicator">
                          <div className={`activity-dot ${record.status}`}></div>
                          Recently Updated
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="user-dashboard">
          {/* Mobile friendly user dashboard can be improved too */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{userStats.total_days}</div>
              <div className="stat-label">Days Logged</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{userStats.present}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h3 className="card-title">Recent Activity History</h3>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {userAttendance.map(a => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{getStatusBadge(a.status)}</td>
                      <td>{a.working_hours || '-'}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
