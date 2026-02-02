import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from './Layout';
import { Icons } from './Icons';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const roleTitles = {
    'HR Manager': 'HRMS',
    HR: 'HRMS',
    Employee: 'EMPLOYEE',
    Admin: 'ADMIN OPS',
    Operations: 'ADMIN OPS',
    Administration: 'ADMIN OPS',
    Accounts: 'ACCOUNTS',
  };

  const menuItems = {
    'HR Manager': [
      { path: '/hr', label: 'Dashboard', Icon: Icons.Dashboard },
      { path: '/hr/employees', label: 'Employees', Icon: Icons.Users },
      { path: '/hr/recruitment', label: 'Recruitment', Icon: Icons.Target },
      { path: '/hr/recruitment/jd', label: 'Job Descriptions', Icon: Icons.FileText },
      { path: '/hr/recruitment/ats', label: 'ATS Upload', Icon: Icons.FileUp },
      { path: '/hr/documents', label: 'Documents', Icon: Icons.FileText },
      { path: '/hr/assets', label: 'Assets', Icon: Icons.Briefcase },
      { path: '/hr/payroll', label: 'Payroll', Icon: Icons.DollarSign },
      { path: '/hr/attendance', label: 'Attendance', Icon: Icons.Clock },
      { path: '/hr/attendance/report', label: 'Attendance Report', Icon: Icons.BarChart },
      { path: '/hr/appraisals', label: 'Appraisals', Icon: Icons.FileText },
      { path: '/hr/pip', label: 'PIP', Icon: Icons.FileText },
      { path: '/administration/set-fields', label: 'Set Fields', Icon: Icons.Settings },
      { path: '/administration/tasks', label: 'Tasks', Icon: Icons.CheckSquare },
      { path: '/administration/gatepass', label: 'Gate Pass', Icon: Icons.Trash },
    ],
    HR: [
      { path: '/hr', label: 'Dashboard', Icon: Icons.Dashboard },
      { path: '/hr/employees', label: 'Employees', Icon: Icons.Users },
      { path: '/hr/recruitment', label: 'Recruitment', Icon: Icons.Target },
      { path: '/hr/recruitment/jd', label: 'Job Descriptions', Icon: Icons.FileText },
      { path: '/hr/recruitment/ats', label: 'ATS Upload', Icon: Icons.FileUp },
      { path: '/hr/documents', label: 'Documents', Icon: Icons.FileText },
      { path: '/hr/assets', label: 'Assets', Icon: Icons.Briefcase },
      { path: '/hr/payroll', label: 'Payroll', Icon: Icons.DollarSign },
      { path: '/hr/attendance', label: 'Attendance', Icon: Icons.Clock },
      { path: '/hr/attendance/report', label: 'Attendance Report', Icon: Icons.BarChart },
      { path: '/hr/appraisals', label: 'Appraisals', Icon: Icons.FileText },
      { path: '/hr/pip', label: 'PIP', Icon: Icons.FileText },
      { path: '/administration/set-fields', label: 'Set Fields', Icon: Icons.Settings },
      { path: '/administration/tasks', label: 'Tasks', Icon: Icons.CheckSquare },
      { path: '/administration/gatepass', label: 'Gate Pass', Icon: Icons.Trash },
    ],
    Employee: [
      { path: '/employee', label: 'Dashboard', Icon: Icons.Dashboard },
      { path: '/employee/profile', label: 'Profile', Icon: Icons.User },
      { path: '/employee/attendance', label: 'Attendance', Icon: Icons.Clock },
      { path: '/employee/documents', label: 'Documents', Icon: Icons.FileText },
    ],
    Admin: [
      { path: '/admin', label: 'Dashboard', Icon: Icons.Dashboard },
      { path: '/admin/features', label: 'Feature Control', Icon: Icons.Sliders },
      { path: '/admin/users', label: 'Users', Icon: Icons.Users },
      { path: '/admin/analytics', label: 'Analytics', Icon: Icons.BarChart },
      { path: '/admin/settings', label: 'Settings', Icon: Icons.Settings },
    ],
    Operations: [
      { path: '/administration', label: 'Dashboard', Icon: Icons.Dashboard },
      { path: '/administration/checklists', label: 'Checklists', Icon: Icons.CheckSquare },
      { path: '/administration/tasks', label: 'Tasks', Icon: Icons.Clipboard },
      { path: '/administration/inventory', label: 'Inventory', Icon: Icons.Package },
      { path: '/administration/expenses', label: 'Expenses', Icon: Icons.CreditCard },
    ],
    Administration: [
      { path: '/administration', label: 'Dashboard', Icon: Icons.Dashboard },
      { path: '/administration/checklists', label: 'Checklists', Icon: Icons.CheckSquare },
      { path: '/administration/tasks', label: 'Tasks', Icon: Icons.Clipboard },
      { path: '/administration/inventory', label: 'Inventory', Icon: Icons.Package },
      { path: '/administration/expenses', label: 'Expenses', Icon: Icons.CreditCard },
    ],
    Accounts: [
      { path: '/accounts', label: 'Dashboard', Icon: Icons.Dashboard },
      { path: '/accounts/deals', label: 'Deals', Icon: Icons.Handshake },
      { path: '/accounts/incentives', label: 'Incentives', Icon: Icons.DollarSign },
      { path: '/accounts/ledger', label: 'Ledger', Icon: Icons.TrendingUp },
      { path: '/accounts/approvals', label: 'Approvals', Icon: Icons.CheckSquare },
    ],
  };

  const currentMenu = menuItems[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      className={`sidebar ${isCollapsed ? 'w-16' : 'w-64'}`}
      style={{ width: isCollapsed ? '4rem' : '16rem' }}
    >
      {/* Header */}
      <div style={{
        padding: '1.5rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!isCollapsed && (
          <h2 className="font-brand animate-fade-in" style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.375rem'
          }}>
            <span style={{ color: 'white' }}>SYNDITECH</span>
            <span style={{ color: 'var(--accent-primary)' }}>{roleTitles[user?.role] || 'HRMS'}</span>
          </h2>
        )}
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="animate-fade-in-up" style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'var(--accent-primary-subtle)',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--accent-primary)'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="truncate" style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {user?.name}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)'
              }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '1rem 0.75rem',
        overflowY: 'auto'
      }}>
        <ul style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          {currentMenu.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.Icon;
            return (
              <li key={item.path} style={{
                animationDelay: `${index * 0.05}s`
              }}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  style={{
                    width: '100%',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? '0' : '0.75rem'
                  }}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon />
                  {!isCollapsed && (
                    <span className="animate-slide-in-right">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1rem 0.75rem',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? '0' : '0.75rem',
            color: '#EF4444',
            marginBottom: '0.5rem'
          }}
          title={isCollapsed ? 'Logout' : ''}
        >
          <Icons.LogOut />
          {!isCollapsed && (
            <span className="animate-slide-in-right">Logout</span>
          )}
        </button>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-item"
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? '0' : '0.75rem'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icons.Menu />
          {!isCollapsed && (
            <span className="animate-slide-in-right">{isCollapsed ? 'Expand' : 'Collapse'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;