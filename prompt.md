# ENTERPRISE REAL ESTATE AUTOMATION PLATFORM – MASTER BUILD PROMPT

You are a senior-level enterprise SaaS architect and full-stack MERN engineer.

Your task is to generate a **production-ready Real Estate Enterprise Automation Platform** using **MERN Stack (MongoDB, Express, React, Node.js)** with **Tailwind CSS**.

This system must be modular, scalable, configurable, and suitable for real-world enterprise usage.

DO NOT oversimplify.
DO NOT generate demo-only code.
Assume real company usage with real payroll, approvals, and audit requirements.

---

## 1. TECH STACK (STRICT – NO DEVIATION)

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Role-based UI rendering
- Reusable components
- PDF & CSV export support for all modules

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- RBAC (Role Based Access Control)

### Database
Use this MongoDB connection string exactly:
mongodb://root:vbPT5AthmBzfWQtaH2MOdbj6nx4d9TFUvmHIGm0htv43pNMEMwMbgby82bqiGhzx@72.61.248.175:5444/?directConnection=true

---

## 2. THEME (MANDATORY)

Use Tailwind theme EXACTLY from:
C:\Users\HP\Desktop\synditech-website\theme.md

Rules:
- Do NOT modify colors
- Do NOT invent UI styles
- Buttons, cards, spacing must match theme.md exactly

---

## 3. CORE ARCHITECTURE RULE

Frontend modules are SEPARATE.
Backend is FULLY LINKED.

NO hardcoded relations.

Create a dedicated backend module:

/backend-linking-customization

This module must allow:
- Changing HR → Payroll → Accounts mappings
- Changing approval flows
- Changing incentive & salary relations
- Enabling / disabling modules
WITHOUT changing source code.

All relations must be database-driven.

---

## 4. ROLE DEFINITIONS

Roles:
- HR
- Employee
- Admin (System only)
- Administration (Office operations)
- Accounts

Admin and Administration are DIFFERENT.

RBAC must be enforced on:
- Backend APIs
- Frontend routes & UI elements

---

## 5. HRMS MODULE

### 5.1 Core HR
- Employee CRUD
- Role assignment
- Company email login system
- Document uploads
- Asset allocation (Laptop, SIM, etc.)
- Status lifecycle: Active, PIP, Resigned

---

### 5.2 Recruitment Module
- Recruitment target setting
- Hiring pipeline:
  JD → Screening → Interview → Offer → Onboard
- Resume upload
- On candidate closure:
  - Resume attachment
  - LOI / AL / OL generation (template based)
  - Company email creation form (password input)
  - Asset allocation checklist
  - Document submission tracking
- Appraisal letter flow
- PIP workflow
- Resignation → Full & Final (FNF) automation

---

### 5.3 ATS Automation
- Upload JD + Resume
- Generate ATS score (rule-based)
- Shortlisting assistance UI

---

## 6. PAYROLL SYSTEM (REAL ESTATE CUSTOM – CRITICAL)

### 6.1 Sales Policy Engine (UI Configurable)

Policies must be editable via UI and stored in DB.

#### Sales Executive
- Sales count logic (1, 2, 3 sales)
- Incentive: 0.25% of CV
- Salary reward logic (+50%)
- Progressive incentive unlock logic

#### Sales Manager
- Per-executive sales tracking
- Incentives: 0.25% & 0.10% of CV
- Salary reward conditions

#### Rules
- Normal Sale: Revenue ≥ 0.5% of CV → 0.25%
- NPL Sale: Revenue < 0.5% of CV → 0.10%
- If NPL < 0.25% → Salary reward only
- Supportive sale → split sale count & incentive equally
- Incentive unlock sequence
- Month-end incentive locking
- 60-day ownership rule

NO logic should be hardcoded.

---

### 6.2 Payroll Calculation
- PF
- Gratuity
- HRA
- Allowances
- Performance rewards
- Auto-calculate button
- Inline edit icon for HR
- Audit trail for overrides

---

## 7. ATTENDANCE & GATEPASS

- Employee login via company credentials
- Check-in / Check-out
- Site visit gatepass after check-in
- Gatepass approval by HR
- Salary deduction if not approved
- Salary credited after approval
- HR approval dashboard

---

## 8. ADMINISTRATION MANAGEMENT (OFFICE OPS)

This is NOT system admin.

Features:
- Daily & one-time checklists
- Recurring tasks
- “Hey you have these tasks today” alerts
- Inventory (milk, stationery, assets)
- Laptop lifecycle management
- Electricity bills
- Subscriptions & tools
- Expense submission to Accounts

---

## 9. ACCOUNTS & FINANCE

- Deal-wise CV tracking
- Incentive locked until builder payment received
- Incentive release approval
- Payroll visibility from HRMS
- Petty cash full ledger system
- Admin expenses integration
- Approve / Reject with reason
- Resubmit approval flow

All payments must be approved by Accounts.

---

## 10. SYSTEM LINKING (CRITICAL)

HRMS → Payroll → Accounts  
Administration → Petty Cash → Accounts  
Sales → Incentives → Accounts  

Reject → Notification → Reason → Resubmit

All links controlled via backend-linking-customization.

---

## 11. REPORTING & EXPORTS

Every module MUST support:
- PDF export
- CSV export
- Date filters
- Department filters
- Role-based visibility

---

## 12. PROJECT STRUCTURE

Backend:
- controllers
- services
- models
- routes
- middlewares
- utils
- config

Frontend:
- modules
- shared components
- layouts
- hooks
- services
- role-based dashboards

---

## 13. FINAL EXPECTATION

This system should feel like:
- Zoho + Darwinbox + Custom Real Estate Payroll Engine

Enterprise-grade.
Scalable.
Configurable.
Audit-safe.

Generate the full project now.
