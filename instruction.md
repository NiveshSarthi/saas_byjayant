# Enterprise Real Estate Automation Platform - Access Instructions

## Overview
This document provides comprehensive instructions for setting up, running, and accessing the Enterprise Real Estate Automation Platform. This SaaS application streamlines HR, payroll, accounts, administration, and recruitment processes for real estate enterprises.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (external connection provided)
- npm or yarn package manager

## Installation and Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd saas-byjayant
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration
Create/update the following environment variables in `backend/.env`:
- `JWT_SECRET`: Your secure JWT secret key (default: 'your_super_secret_jwt_key_here')
- `PORT`: Server port (default: 5000)

Note: MongoDB URI is hardcoded in `backend/server.js` for this deployment:
```
mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true
```

## Running the Application

### Backend
- Development: `cd backend && npm run dev` (uses nodemon for auto-restart)
- Production: `cd backend && npm start`

The backend server will run on `http://localhost:5000` (or configured PORT).

### Frontend
- Development: `cd frontend && npm run dev`
- Build for production: `cd frontend && npm run build`
- Preview production build: `cd frontend && npm run preview`

The frontend will run on `http://localhost:5173` (Vite default).

## User Roles and Access Levels

The application supports the following roles with specific access permissions:

### 1. Admin
**Full System Access**
- Create and manage all user accounts
- Access all modules and dashboards
- Configure linking customizations (approval flows, module links, incentive relations, module configs)
- System administration and configuration

### 2. HR (Human Resources)
**HR Management Access**
- Employee management (view, create, update, delete employees)
- Recruitment pipeline (job descriptions, candidates, offers)
- Document management (upload and manage employee documents)
- Asset management and checklists
- Payroll configuration and calculation
- Attendance monitoring and approvals
- Gatepass approvals

### 3. Employee
**Self-Service Access**
- Personal profile management
- Attendance check-in/check-out
- Gatepass requests
- View own documents and assets
- Limited access to personal payroll information

### 4. Administration
**Operational Management Access**
- Checklist creation and management
- Task assignment and tracking
- Inventory management
- Expense tracking and reporting
- Operational workflows

### 5. Accounts
**Financial Management Access**
- Deal tracking and management
- Incentive approvals and releases
- Petty cash ledger management
- Expense approval workflows
- Financial reporting and exports

## Accessing the Application

### Frontend Dashboards
After logging in, users are redirected to role-specific dashboards:

- **Admin Dashboard**: `http://localhost:5173/admin` - Full system overview and management
- **HR Dashboard**: `http://localhost:5173/hr` - HR operations and employee management
- **Employee Dashboard**: `http://localhost:5173/employee` - Personal tools and information
- **Administration Dashboard**: `http://localhost:5173/administration` - Operational management
- **Accounts Dashboard**: `http://localhost:5173/accounts` - Financial operations

### Login Process
1. Navigate to the application URL
2. Enter username/email and password
3. System authenticates and redirects to appropriate dashboard based on role

## Module Access by Role

### HR Module
- **Accessible by**: HR, Admin
- **Features**: Employee CRUD, Recruitment, Documents, Assets, Payroll, Attendance
- **Frontend**: HRDashboard.jsx with tabs for each submodule

### Employee Module
- **Accessible by**: All roles (with varying permissions)
- **Features**: Profile management, document uploads, asset assignments
- **Frontend**: EmployeeForm.jsx, EmployeeList.jsx (HR/Admin view)

### Recruitment Module
- **Accessible by**: HR, Admin
- **Features**: JD creation, candidate management, ATS upload, offer generation
- **Frontend**: RecruitmentPipeline.jsx, JDForm.jsx, CandidateForm.jsx, OfferForm.jsx

### Payroll Module
- **Accessible by**: HR, Admin
- **Features**: Policy configuration, payroll calculation, salary management
- **Frontend**: PolicyConfig.jsx, PayrollCalculator.jsx

### Accounts Module
- **Accessible by**: Accounts, Admin
- **Features**: Deal tracking, incentive management, petty cash, expense approvals
- **Frontend**: DealTracking.jsx, ExpenseApprovals.jsx, IncentiveApproval.jsx, PettyCashLedger.jsx

### Administration Module
- **Accessible by**: Administration, Admin
- **Features**: Checklists, tasks, inventory, expenses
- **Frontend**: Checklists.jsx, Tasks.jsx, Inventory.jsx, Expenses.jsx

### Attendance Module
- **Accessible by**: All employees (self-service), HR/Admin (approvals)
- **Features**: Check-in/out, attendance history, gatepass requests
- **Frontend**: CheckInOut.jsx, GatepassRequest.jsx, HRApprovalDashboard.jsx

### Linking Customization Module
- **Accessible by**: Admin only
- **Features**: Configure approval flows, module links, incentive relations, module configurations
- **Frontend**: ApprovalFlows.jsx, ModuleLinks.jsx, IncentiveRelations.jsx, ModuleConfig.jsx

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `POST /api/auth/logout` - User logout

### HRMS (Human Resource Management System)
- `GET /api/hrms/employees` - Get all employees
- `POST /api/hrms/employees` - Create employee
- `GET /api/hrms/employees/:id` - Get employee by ID
- `PUT /api/hrms/employees/:id` - Update employee
- `DELETE /api/hrms/employees/:id` - Delete employee
- `GET /api/hrms/employees/my-profile` - Get own profile (Employee)
- `POST /api/hrms/employees/add-document` - Add document to employee
- `POST /api/hrms/employees/add-asset` - Add asset to employee
- `GET /api/hrms/employees/export/pdf` - Export employees PDF
- `GET /api/hrms/employees/export/csv` - Export employees CSV

### Recruitment
- `GET /api/hrms/recruitment` - Get all recruitments
- `POST /api/hrms/recruitment` - Create recruitment
- `GET /api/hrms/recruitment/:id` - Get recruitment by ID
- `PUT /api/hrms/recruitment/:id` - Update recruitment
- `DELETE /api/hrms/recruitment/:id` - Delete recruitment
- `POST /api/hrms/recruitment/add-candidate` - Add candidate
- `PUT /api/hrms/recruitment/update-candidate-stage` - Update candidate stage
- `POST /api/hrms/recruitment/generate-offer` - Generate offer
- `GET /api/hrms/recruitment/export/pdf` - Export recruitments PDF
- `GET /api/hrms/recruitment/export/csv` - Export recruitments CSV

### Documents
- `POST /api/hrms/documents/upload` - Upload document
- `GET /api/hrms/documents` - Get documents

### ATS (Applicant Tracking System)
- `POST /api/ats/upload` - Upload resumes (HR)
- `POST /api/ats/score/:id` - Compute scores (HR)

### Payroll
- `GET /api/payroll` - Get payrolls
- `POST /api/payroll` - Create payroll
- `GET /api/payroll/:id` - Get payroll by ID
- `PUT /api/payroll/:id` - Update payroll
- `DELETE /api/payroll/:id` - Delete payroll
- `POST /api/payroll/calculate` - Calculate payroll
- `GET /api/payroll/export/pdf` - Export payrolls PDF
- `GET /api/payroll/export/csv` - Export payrolls CSV

### Sales Policy
- `GET /api/sales-policy` - Get policies
- `POST /api/sales-policy` - Create policy
- `PUT /api/sales-policy/:id` - Update policy
- `DELETE /api/sales-policy/:id` - Delete policy

### Administration
- `POST /api/administration/checklists` - Create checklist
- `GET /api/administration/checklists` - Get checklists
- `PUT /api/administration/checklists/:id` - Update checklist
- `DELETE /api/administration/checklists/:id` - Delete checklist
- `POST /api/administration/tasks` - Create task
- `GET /api/administration/tasks` - Get tasks
- `PUT /api/administration/tasks/:id` - Update task
- `DELETE /api/administration/tasks/:id` - Delete task
- `POST /api/administration/inventory` - Create inventory item
- `GET /api/administration/inventory` - Get inventory
- `PUT /api/administration/inventory/:id` - Update inventory item
- `DELETE /api/administration/inventory/:id` - Delete inventory item
- `POST /api/administration/expenses` - Create expense
- `GET /api/administration/expenses` - Get expenses
- `PUT /api/administration/expenses/:id` - Update expense
- `DELETE /api/administration/expenses/:id` - Delete expense
- `GET /api/administration/export/pdf` - Export tasks PDF
- `GET /api/administration/export/csv` - Export tasks CSV

### Accounts
- `GET /api/accounts/deals` - Get deals
- `PUT /api/accounts/deals/:id` - Update deal
- `POST /api/accounts/deals/incentive` - Create deal incentive
- `GET /api/accounts/incentives` - Get incentives
- `PUT /api/accounts/incentives/:id/approve` - Approve incentive release
- `PUT /api/accounts/incentives/:id/release` - Release incentive
- `GET /api/accounts/petty-cash` - Get petty cash ledger
- `POST /api/accounts/petty-cash` - Add petty cash entry
- `GET /api/accounts/expenses/pending` - Get pending expenses
- `PUT /api/accounts/expenses/:id/approve` - Approve expense request
- `PUT /api/accounts/expenses/:id/reject` - Reject expense request
- `GET /api/accounts/export/pdf` - Export deals PDF
- `GET /api/accounts/export/csv` - Export deals CSV

### Attendance
- `POST /api/attendance/check-in` - Check-in (Employee)
- `POST /api/attendance/check-out` - Check-out (Employee)
- `GET /api/attendance/history` - Get attendance history (Employee)
- `GET /api/attendance` - Get all attendances (HR/Admin)
- `GET /api/attendance/export/pdf` - Export attendances PDF (HR/Admin)
- `GET /api/attendance/export/csv` - Export attendances CSV (HR/Admin)

### Gatepass
- `POST /api/gatepass/request` - Request gatepass (Employee)
- `GET /api/gatepass/my` - Get my gatepasses (Employee)
- `GET /api/gatepass/pending` - Get pending gatepasses (HR/Admin)
- `PUT /api/gatepass/:id/approve` - Approve gatepass (HR/Admin)
- `PUT /api/gatepass/:id/reject` - Reject gatepass (HR/Admin)

### Linking Customization (Admin Only)
- `GET /api/linking/module-links` - Get module links
- `POST /api/linking/module-links` - Create module link
- `PUT /api/linking/module-links/:id` - Update module link
- `DELETE /api/linking/module-links/:id` - Delete module link
- `GET /api/linking/module-links/export/pdf` - Export module links PDF
- `GET /api/linking/module-links/export/csv` - Export module links CSV
- `GET /api/linking/approval-flows` - Get approval flows
- `POST /api/linking/approval-flows` - Create approval flow
- `PUT /api/linking/approval-flows/:id` - Update approval flow
- `DELETE /api/linking/approval-flows/:id` - Delete approval flow
- `GET /api/linking/incentive-relations` - Get incentive relations
- `POST /api/linking/incentive-relations` - Create incentive relation
- `PUT /api/linking/incentive-relations/:id` - Update incentive relation
- `DELETE /api/linking/incentive-relations/:id` - Delete incentive relation
- `GET /api/linking/module-configs` - Get module configs
- `POST /api/linking/module-configs` - Create module config
- `PUT /api/linking/module-configs/:id` - Update module config
- `DELETE /api/linking/module-configs/:id` - Delete module config

## Creating Initial Users

1. **First Admin User**: Since registration requires Admin role, the first admin must be created directly in the database or by modifying the code temporarily to allow registration without RBAC check.

2. **Subsequent Users**: Admin users can create other users via the registration endpoint:
   - POST `/api/auth/register`
   - Required fields: name, email, password, role
   - Roles: 'HR', 'Employee', 'Admin', 'Administration', 'Accounts'

3. **Sample Data Creation**:
   - Use the respective module forms in the frontend dashboards
   - Or directly via API calls with appropriate authentication
   - For testing: Create sample employees, deals, tasks, etc., through the UI

## Theme and UI Notes

### Design System
- **Primary Color**: Black (#000)
- **Text Color**: White (#fff)
- **Accent Colors**: Orange gradients (#f97316 to #ea580c)
- **Secondary**: Blue-900 with 20% opacity
- **Font**: Orbitron for headings, system fonts for body text

### UI Components
- **Buttons**: Gradient orange primary buttons with hover scale effect, outline variant for secondary actions
- **Cards**: Clean white cards on dark background
- **Layout**: Responsive design with sidebar navigation in dashboards
- **Icons**: Minimalist icons for actions and navigation

### Customization
- Theme is defined in `frontend/tailwind.config.js`
- Custom utilities for gradients and button styles
- Dark theme optimized for enterprise environments

## Linking Customization Usage

The linking customization module allows admins to configure advanced workflows:

1. **Module Links**: Define relationships between different modules (e.g., link employee to specific accounts or projects)

2. **Approval Flows**: Set up multi-level approval processes for expenses, incentives, or other requests

3. **Incentive Relations**: Configure how incentives are calculated and linked to performance metrics

4. **Module Configs**: Customize module behaviors and integrations

Access via Admin dashboard > Linking tab, or directly via `/api/linking` endpoints.

## Security Notes
- All API endpoints except login require JWT authentication
- Role-based access control (RBAC) enforced on sensitive operations
- File uploads are handled securely with multer
- Passwords are hashed using bcryptjs

## Troubleshooting
- Ensure MongoDB connection is active
- Check console logs for backend errors
- Verify environment variables are set correctly
- Clear browser cache if UI issues occur

## Enterprise Deployment Considerations
- Scale MongoDB for high-traffic scenarios
- Implement load balancing for multiple backend instances
- Use HTTPS in production
- Regular backup of database
- Monitor API usage and performance
- Implement audit logging for compliance

---

**Completion Summary**: Comprehensive access instructions document created successfully, covering all requested aspects for enterprise usage of the SaaS platform.