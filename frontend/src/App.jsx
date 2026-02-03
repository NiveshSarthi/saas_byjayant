import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SYNDITECHDashboard from './pages/SYNDITECHDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationPanel from './components/shared/NotificationPanel';
import InboxPanel from './components/shared/InboxPanel';
import HRDashboard from '../role-based-dashboards/HRDashboard';
import EmployeeDashboard from '../role-based-dashboards/EmployeeDashboard';
import AdminDashboard from '../role-based-dashboards/AdminDashboard';
import AdministrationDashboard from '../role-based-dashboards/AdministrationDashboard';
import AccountsDashboard from '../role-based-dashboards/AccountsDashboard';

// HRMS Modules
import EmployeeList from '../modules/hrms/EmployeeList';
import EmployeeForm from '../modules/hrms/EmployeeForm';
import RecruitmentPipeline from '../modules/hrms/RecruitmentPipeline';
import CandidateForm from '../modules/hrms/CandidateForm';
import JDForm from '../modules/hrms/JDForm';
import OfferForm from '../modules/hrms/OfferForm';
import ATSUpload from '../modules/hrms/ATSUpload';
import DocumentManagement from '../modules/hrms/DocumentManagement';
import DocumentUpload from '../modules/hrms/DocumentUpload';
import AssetChecklist from '../modules/hrms/AssetChecklist';
import EmployeeLifecycle from '../modules/hrms/EmployeeLifecycle';
import AppraisalList from '../modules/hrms/AppraisalList';
import PIPList from '../modules/hrms/PIPList';
import ResignationApprovals from '../modules/hrms/ResignationApprovals';

// Payroll Modules
import PayrollCalculator from '../modules/payroll/PayrollCalculator';
import PolicyConfig from '../modules/payroll/PolicyConfig';

// Attendance Modules
import CheckInOut from '../modules/attendance/CheckInOut';
import GatepassRequest from '../modules/attendance/GatepassRequest';
import HRApprovalDashboard from '../modules/attendance/HRApprovalDashboard';
import AttendanceReport from '../modules/attendance/AttendanceReport';

// Administration Modules
import Checklists from '../modules/administration/Checklists';
import Tasks from '../modules/administration/Tasks';
import Inventory from '../modules/administration/Inventory';
import Expenses from '../modules/administration/Expenses';
import Gatepass from '../modules/administration/Gatepass';
import SetFields from '../modules/administration/SetFields';

// Accounts Modules
import DealTracking from '../modules/accounts/DealTracking';
import SalesLogging from '../modules/accounts/SalesLogging';
import IncentiveApproval from '../modules/accounts/IncentiveApproval';
import PettyCashLedger from '../modules/accounts/PettyCashLedger';
import ExpenseApprovals from '../modules/accounts/ExpenseApprovals';
import BackendLinking from '../modules/linking/BackendLinking';

const Dashboard = () => {
  const { user } = useAuth();
  switch (user.role) {
    case 'HR Manager':
    case 'HR':
      return <HRDashboard />;
    case 'Employee':
      return <EmployeeDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    case 'Operations':
    case 'Administration':
      return <AdministrationDashboard />;
    case 'Accounts':
      return <AccountsDashboard />;
    default:
      console.log('No dashboard found for role:', user.role);
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/synditech" element={<SYNDITECHDashboard />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* HR Routes */}
          <Route path="/hr" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><EmployeeList /></ProtectedRoute>} />
          <Route path="/hr/employees/add" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><EmployeeForm /></ProtectedRoute>} />
          <Route path="/hr/employees/edit/:id" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><EmployeeForm /></ProtectedRoute>} />
          <Route path="/hr/recruitment" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><RecruitmentPipeline /></ProtectedRoute>} />
          <Route path="/hr/recruitment/candidate" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><CandidateForm /></ProtectedRoute>} />
          <Route path="/hr/recruitment/jd" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><JDForm /></ProtectedRoute>} />
          <Route path="/hr/recruitment/offer" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><OfferForm /></ProtectedRoute>} />
          <Route path="/hr/recruitment/ats" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><ATSUpload /></ProtectedRoute>} />
          <Route path="/hr/documents" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><DocumentManagement /></ProtectedRoute>} />
          <Route path="/hr/assets" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><AssetChecklist /></ProtectedRoute>} />
          <Route path="/hr/lifecycle" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><EmployeeLifecycle /></ProtectedRoute>} />
          <Route path="/hr/payroll" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><PayrollCalculator /></ProtectedRoute>} />
          <Route path="/hr/payroll/config" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><PolicyConfig /></ProtectedRoute>} />
          <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><HRApprovalDashboard /></ProtectedRoute>} />
          <Route path="/hr/attendance/report" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><AttendanceReport /></ProtectedRoute>} />
          <Route path="/hr/appraisals" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><AppraisalList /></ProtectedRoute>} />
          <Route path="/hr/pip" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><PIPList /></ProtectedRoute>} />
          <Route path="/hr/resignations" element={<ProtectedRoute allowedRoles={['HR Manager', 'HR']}><ResignationApprovals /></ProtectedRoute>} />

          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeForm /></ProtectedRoute>} />
          <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['Employee']}><CheckInOut /></ProtectedRoute>} />
          <Route path="/employee/notifications" element={<ProtectedRoute allowedRoles={['Employee']}><NotificationPanel /></ProtectedRoute>} />
          <Route path="/employee/inbox" element={<ProtectedRoute allowedRoles={['Employee']}><InboxPanel /></ProtectedRoute>} />
          <Route path="/employee/gatepass" element={<ProtectedRoute allowedRoles={['Employee']}><GatepassRequest /></ProtectedRoute>} />
          <Route path="/employee/documents" element={<ProtectedRoute allowedRoles={['Employee']}><DocumentUpload /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/features" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['Admin']}><EmployeeList /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['Admin']}><PolicyConfig /></ProtectedRoute>} />

          {/* Administration Routes */}
          <Route path="/administration" element={<ProtectedRoute allowedRoles={['Operations', 'Administration']}><AdministrationDashboard /></ProtectedRoute>} />
          <Route path="/administration/checklists" element={<ProtectedRoute allowedRoles={['Operations', 'Administration']}><Checklists /></ProtectedRoute>} />
          <Route path="/administration/set-fields" element={<ProtectedRoute allowedRoles={['Operations', 'Administration', 'HR Manager', 'HR']}><SetFields /></ProtectedRoute>} />
          <Route path="/administration/tasks" element={<ProtectedRoute allowedRoles={['Operations', 'Administration', 'HR Manager', 'HR']}><Tasks /></ProtectedRoute>} />
          <Route path="/administration/gatepass" element={<ProtectedRoute allowedRoles={['Operations', 'Administration', 'HR Manager', 'HR']}><Gatepass /></ProtectedRoute>} />
          <Route path="/administration/inventory" element={<ProtectedRoute allowedRoles={['Operations', 'Administration']}><Inventory /></ProtectedRoute>} />
          <Route path="/administration/expenses" element={<ProtectedRoute allowedRoles={['Operations', 'Administration']}><Expenses /></ProtectedRoute>} />

          {/* Accounts Routes */}
          <Route path="/accounts" element={<ProtectedRoute allowedRoles={['Accounts']}><AccountsDashboard /></ProtectedRoute>} />
          <Route path="/accounts/deals" element={<ProtectedRoute allowedRoles={['Accounts']}><DealTracking /></ProtectedRoute>} />
          <Route path="/accounts/log-sales" element={<ProtectedRoute allowedRoles={['Accounts']}><SalesLogging /></ProtectedRoute>} />
          <Route path="/accounts/incentives" element={<ProtectedRoute allowedRoles={['Accounts']}><IncentiveApproval /></ProtectedRoute>} />
          <Route path="/accounts/ledger" element={<ProtectedRoute allowedRoles={['Accounts']}><PettyCashLedger /></ProtectedRoute>} />
          <Route path="/accounts/approvals" element={<ProtectedRoute allowedRoles={['Accounts']}><ExpenseApprovals /></ProtectedRoute>} />

          {/* Customization Routes */}
          <Route path="/backend-linking-customization" element={<ProtectedRoute allowedRoles={['Admin', 'Accounts', 'HR Manager', 'HR']}><BackendLinking /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
