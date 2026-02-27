# AttendEase - System Architecture

> **Comprehensive technical architecture documentation for the Employee Attendance Management System**

---

## Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Technology Stack](#technology-stack)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [API Architecture](#api-architecture)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Scalability Considerations](#scalability-considerations)

---

## System Overview

AttendEase is a modern, full-stack employee attendance management system designed with a **separation of concerns** philosophy. The application follows a **client-server architecture** where the frontend and backend are decoupled, communicating via RESTful APIs.

### Key Architectural Principles

| Principle | Implementation |
|-----------|----------------|
| **Separation of Concerns** | Frontend (React) and Backend (Django) are separate applications |
| **RESTful API Design** | All communication via standardized REST endpoints |
| **Stateless Authentication** | JWT-based stateless authentication |
| **Role-Based Access Control** | Permission system based on user roles |
| **Database Normalization** | Efficient relational database design |
| **API-First Development** | Backend exposes well-documented API endpoints |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                     React Application (Vite)                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │  Pages   │  │Components│  │ Context  │  │   API    │           │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │  │
│  │       │             │             │             │                  │  │
│  │       └─────────────┴─────────────┴─────────────┘                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Django REST Framework                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │   URLs   │  │  Views   │  │Serializers│ │Middleware│           │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │  │
│  └───────┴─────────────┴─────────────┴─────────────┴──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS LOGIC LAYER                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │   Authentication     │  │      Employees       │                    │
│  │        App           │  │         App          │                    │
│  │  ┌────────────────┐  │  │  ┌────────────────┐ │                    │
│  │  │     User       │  │  │  │   Employee     │ │                    │
│  │  │ PasswordToken  │  │  │  │   Department   │ │                    │
│  │  │ EmailToken     │  │  │  │   Attendance   │ │                    │
│  │  └────────────────┘  │  │  │   LeaveRequest │ │                    │
│  └──────────────────────┘  │  └────────────────┘ │                    │
│                            └──────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      PostgreSQL Database                            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │  │
│  │  │ auth_user  │ │ employees  │ │ attendance │ │ departments│      │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Django 5.x | Web application framework |
| **API Layer** | Django REST Framework | RESTful API development |
| **Authentication** | djangorestframework-simplejwt | JWT token authentication |
| **Database** | PostgreSQL 15+ | Relational database |
| **Database Adapter** | dj-database-url | Database URL parsing |
| **CORS Handling** | django-cors-headers | Cross-origin resource sharing |
| **Static Files** | WhiteNoise | Static file serving |
| **API Documentation** | drf-spectacular | OpenAPI/Swagger documentation |
| **Environment** | python-dotenv | Environment variable management |

### Frontend Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | React 18 | UI component library |
| **Build Tool** | Vite | Fast build and development |
| **Routing** | React Router v6 | Client-side routing |
| **State Management** | React Context + Hooks | Global state management |
| **HTTP Client** | Fetch API | API communication |
| **Icons** | Lucide React | SVG icon library |
| **Styling** | CSS (Custom) | Component styling |

---

## Backend Architecture

### Application Structure

```
backend/
├── config/                          # Project configuration
│   ├── __init__.py
│   ├── settings.py                  # Django settings
│   ├── urls.py                      # Root URL configuration
│   ├── wsgi.py                      # WSGI application entry
│   └── asgi.py                      # ASGI application entry
│
├── authentication/                  # Authentication app
│   ├── __init__.py
│   ├── models.py                    # User, PasswordResetToken, EmailVerificationToken
│   ├── views.py                     # Auth views (login, register, etc.)
│   ├── serializers.py               # Auth serializers
│   ├── urls.py                      # Auth URL routes
│   ├── admin.py                     # Admin panel configuration
│   ├── tests.py                     # Unit tests
│   └── management/
│       └── commands/
│           └── create_superuser.py  # Custom superuser command
│
├── employees/                       # Employees app
│   ├── __init__.py
│   ├── models.py                    # Employee, Department, Attendance, LeaveRequest
│   ├── views.py                     # Employee/Attendance/Leave views
│   ├── serializers.py               # Data serializers
│   ├── urls.py                      # URL routes (Router)
│   ├── admin.py                     # Admin panel configuration
│   ├── tests.py                     # Unit tests
│   └── migrations/                  # Database migrations
│
├── templates/                       # Email templates
│   └── emails/
│       ├── welcome.html
│       ├── verify_email.html
│       ├── password_reset.html
│       └── password_changed.html
│
├── manage.py                        # Django management script
└── requirements.txt                 # Python dependencies
```

### Django Apps Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Django Project                           │
│                         (config/)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐       ┌─────────────────────┐         │
│  │   authentication    │       │      employees      │         │
│  │       (App)         │       │        (App)        │         │
│  ├─────────────────────┤       ├─────────────────────┤         │
│  │                     │       │                     │         │
│  │  • User Model       │◄──────┤  • Department      │         │
│  │  • PasswordToken    │       │  • Employee         │         │
│  │  • EmailToken       │       │  • Attendance       │         │
│  │                     │       │  • LeaveRequest     │         │
│  │  • Register         │       │                     │         │
│  │  • Login/Logout     │       │  • Employee CRUD    │         │
│  │  • Password Reset   │       │  • Check In/Out     │         │
│  │  • Email Verify     │       │  • Leave Management │         │
│  │  • User Profile     │       │  • Attendance Stats │         │
│  │                     │       │                     │         │
│  └─────────────────────┘       └─────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### ViewSets and Actions

```
employees/views.py
│
├── DepartmentViewSet (ModelViewSet)
│   ├── list          → GET    /api/departments/
│   ├── create        → POST   /api/departments/
│   ├── retrieve      → GET    /api/departments/{id}/
│   ├── update        → PUT    /api/departments/{id}/
│   ├── destroy       → DELETE /api/departments/{id}/
│   └── employees     → GET    /api/departments/{id}/employees/
│
├── EmployeeViewSet (ModelViewSet)
│   ├── list          → GET    /api/employees/
│   ├── create        → POST   /api/employees/
│   ├── retrieve      → GET    /api/employees/{id}/
│   ├── update        → PUT    /api/employees/{id}/
│   ├── destroy       → DELETE /api/employees/{id}/
│   ├── attendance    → GET    /api/employees/{id}/attendance/
│   ├── active        → GET    /api/employees/active/
│   └── link_user     → POST   /api/employees/{id}/link_user/
│
├── AttendanceViewSet (ModelViewSet)
│   ├── list          → GET    /api/attendance/
│   ├── create        → POST   /api/attendance/
│   ├── retrieve      → GET    /api/attendance/{id}/
│   ├── update        → PUT    /api/attendance/{id}/
│   ├── destroy       → DELETE /api/attendance/{id}/
│   ├── today         → GET    /api/attendance/today/
│   ├── stats         → GET    /api/attendance/stats/
│   ├── daily_summary → GET    /api/attendance/daily_summary/
│   ├── check_in      → POST   /api/attendance/check_in/
│   └── check_out     → POST   /api/attendance/check_out/
│
└── LeaveRequestViewSet (ModelViewSet)
    ├── list          → GET    /api/leave-requests/
    ├── create        → POST   /api/leave-requests/
    ├── retrieve      → GET    /api/leave-requests/{id}/
    ├── update        → PUT    /api/leave-requests/{id}/
    ├── destroy       → DELETE /api/leave-requests/{id}/
    ├── approve       → POST   /api/leave-requests/{id}/approve/
    └── reject        → POST   /api/leave-requests/{id}/reject/
```

---

## Frontend Architecture

### Application Structure

```
frontend/
├── public/                          # Static assets
│   └── vite.svg
│
├── src/
│   ├── main.jsx                     # Application entry point
│   ├── App.jsx                      # Root component with routes
│   ├── index.css                    # Global styles
│   │
│   ├── api/                         # API service layer
│   │   └── index.js                 # API functions (axios wrapper)
│   │
│   ├── components/                  # Reusable components
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   └── Modal.jsx               # Modal dialog component
│   │
│   ├── context/                     # React context providers
│   │   └── AuthContext.jsx         # Authentication context
│   │
│   ├── pages/                       # Page components
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   ├── Employees.jsx           # Employee directory
│   │   ├── AddEmployee.jsx         # Add employee form
│   │   ├── EditEmployee.jsx        # Edit employee form
│   │   ├── Departments.jsx         # Department management
│   │   ├── Attendance.jsx          # Attendance management
│   │   ├── CheckIn.jsx             # Check-in/out page
│   │   ├── LeaveRequests.jsx       # Leave management
│   │   └── auth/                   # Authentication pages
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── ForgotPassword.jsx
│   │       └── ResetPassword.jsx
│   │
│   └── assets/                      # Images, fonts, etc.
│       └── react.svg
│
├── vite.config.js                   # Vite configuration
├── vercel.json                      # Vercel deployment config
├── package.json                     # NPM dependencies
└── index.html                       # HTML template
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          App.jsx (Root)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    AuthProvider (Context)                     │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                   Router (BrowserRouter)                │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐    │  │  │
│  │  │  │              Routes Configuration              │    │  │  │
│  │  │  │                                                 │    │  │  │
│  │  │  │  Public Routes:                                 │    │  │  │
│  │  │  │  ├── /login       → Login.jsx                   │    │  │  │
│  │  │  │  ├── /register    → Register.jsx                │    │  │  │
│  │  │  │  ├── /forgot-password → ForgotPassword.jsx      │    │  │  │
│  │  │  │  └── /reset-password/:token → ResetPassword.jsx │    │  │  │
│  │  │  │                                                 │    │  │  │
│  │  │  │  Protected Routes (requires auth):               │    │  │  │
│  │  │  │  ├── /              → Dashboard.jsx              │    │  │  │
│  │  │  │  ├── /employees    → Employees.jsx              │    │  │  │
│  │  │  │  ├── /employees/add → AddEmployee.jsx           │    │  │  │
│  │  │  │  ├── /employees/edit/:id → EditEmployee.jsx     │    │  │  │
│  │  │  │  ├── /departments → Departments.jsx            │    │  │  │
│  │  │  │  ├── /attendance  → Attendance.jsx             │    │  │  │
│  │  │  │  ├── /check-in    → CheckIn.jsx                │    │  │  │
│  │  │  │  └── /leave-requests → LeaveRequests.jsx       │    │  │  │
│  │  │  │                                                 │    │  │  │
│  │  │  │  Layout Component:                              │    │  │  │
│  │  │  │  ┌─────────────────────────────────────────┐    │    │  │  │
│  │  │  │  │  Sidebar  │    Main Content Area        │    │  │  │
│  │  │  │  │  (nav)    │    (children)               │    │  │  │
│  │  │  │  └─────────────────────────────────────────┘    │  │  │
│  │  │  └─────────────────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AuthContext Provider                         │
│                                                                 │
│  State:                                                         │
│  ├── user: User object | null                                   │
│  ├── loading: boolean                                           │
│  └── isAuthenticated: boolean                                  │
│                                                                 │
│  Actions:                                                       │
│  ├── login(email, password) → Promise                          │
│  ├── logout() → Promise                                         │
│  ├── register(userData) → Promise                              │
│  └── fetchUser() → Promise                                      │
│                                                                 │
│  Persistence:                                                   │
│  └── Tokens stored in localStorage                             │
│       ├── access_token (1 hour TTL)                             │
│       └── refresh_token (7 days TTL)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Component Consumption                       │
│                                                                 │
│  const { user, login, logout, isAuthenticated } = useAuth();   │
│                                                                 │
│  Used in:                                                       │
│  ├── Sidebar.jsx (show user info, logout button)               │
│  ├── Dashboard.jsx (admin check for different views)           │
│  ├── CheckIn.jsx (self-service vs admin mode)                  │
│  ├── LeaveRequests.jsx (submit own vs all requests)            │
│  └── Protected Routes (auth check)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATABASE: PostgreSQL                        │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐       ┌────────────────────┐
│ authentication_user │       │    department      │
├────────────────────┤       ├────────────────────┤
│ id (UUID) PK       │       │ id (PK)            │
│ email (unique)     │       │ name (unique)      │
│ username           │       │ description        │
│ password (hashed)  │       │ created_at         │
│ role               │       │ updated_at         │
│ phone              │       └─────────┬──────────┘
│ avatar             │                 │
│ department_id FK ──┼─────────────────┘
│ is_employee        │                 │
│ employee_id FK     │                 │
│ created_at         │       ┌─────────▼──────────┐
│ updated_at         │       │      employee      │
└────────────────────┘       ├────────────────────┤
                             │ id (PK)            │
                             │ employee_id(unique)│
                             │ first_name         │
                             │ last_name          │
                             │ email (unique)     │
                             │ phone (unique)     │
                             │ gender             │
                             │ date_of_birth      │
                             │ department_id FK   │
                             │ position           │
                             │ hire_date          │
                             │ status             │
                             │ address            │
                             │ avatar             │
                             │ created_at         │
                             │ updated_at         │
                             └─────────┬──────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│    attendance      │   │   leave_request    │   │ password_reset_tok │
├────────────────────┤   ├────────────────────┤   ├────────────────────┤
│ id (PK)            │   │ id (PK)            │   │ id (UUID) PK       │
│ employee_id FK     │   │ employee_id FK     │   │ user_id FK         │
│ date               │   │ leave_type         │   │ token (UUID)       │
│ check_in           │   │ start_date         │   │ created_at         │
│ check_out          │   │ end_date           │   │ expires_at         │
│ status             │   │ reason             │   │ used               │
│ notes              │   │ status             │   └────────────────────┘
│ created_at         │   │ admin_comment      │
│ updated_at         │   │ reviewed_by_id FK  │   ┌────────────────────┐
└────────────────────┘   │ reviewed_at        │   │email_verification_│
    unique: [employee,  │ created_at         │   │       token        │
             date]      │ updated_at         │   ├────────────────────┤
                         └────────────────────┘   │ id (UUID) PK       │
                                                  │ user_id FK         │
                                                  │ token (UUID)       │
                                                  │ created_at         │
                                                  │ expires_at         │
                                                  │ verified           │
                                                  └────────────────────┘
```

### Table Definitions

#### Users Table (authentication_user)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| email | VARCHAR(254) | Unique, NOT NULL |
| username | VARCHAR(150) | Unique, NOT NULL |
| password | VARCHAR(128) | NOT NULL (hashed) |
| role | VARCHAR(10) | Default: 'user' |
| phone | VARCHAR(17) | Nullable |
| avatar | VARCHAR(100) | Nullable (path) |
| department_id | INTEGER | FK → department.id |
| is_employee | BOOLEAN | Default: False |
| employee_id | INTEGER | FK → employee.id (OneToOne) |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

#### Employees Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| employee_id | VARCHAR(20) | Unique, Auto-generated |
| first_name | VARCHAR(50) | NOT NULL |
| last_name | VARCHAR(50) | NOT NULL |
| email | VARCHAR(254) | Unique |
| phone | VARCHAR(17) | Unique, Nullable |
| gender | CHAR(1) | 'M', 'F', 'O' |
| date_of_birth | DATE | Nullable |
| department_id | INTEGER | FK → department.id |
| position | VARCHAR(100) | Nullable |
| hire_date | DATE | NOT NULL |
| status | VARCHAR(20) | 'active', 'inactive', 'on_leave' |
| address | TEXT | Nullable |
| avatar | VARCHAR(100) | Nullable |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

#### Attendance Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| employee_id | INTEGER | FK → employee.id |
| date | DATE | NOT NULL |
| check_in | TIME | Nullable |
| check_out | TIME | Nullable |
| status | VARCHAR(20) | Default: 'present' |
| notes | TEXT | Nullable |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

**Unique Constraint:** (employee_id, date)

#### Leave Requests Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| employee_id | INTEGER | FK → employee.id |
| leave_type | VARCHAR(20) | NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| reason | TEXT | NOT NULL |
| status | VARCHAR(20) | Default: 'pending' |
| admin_comment | TEXT | Nullable |
| reviewed_by_id | UUID | FK → auth_user.id |
| reviewed_at | TIMESTAMP | Nullable |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

---

## Authentication Flow

### JWT Authentication Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                                │
└──────────────────────────────────────────────────────────────────────────┘

1. REGISTRATION FLOW:
┌─────────┐     POST /register      ┌─────────┐     Create User     ┌─────────┐
│  Client │ ──────────────────────► │  Server │ ───────────────────►│Database │
│         │                         │         │                     │         │
│         │ ◄───────────────────── │         │                     │         │
└─────────┘   User + Tokens         └─────────┘                     └─────────┘
              (access + refresh)


2. LOGIN FLOW:
┌─────────┐     POST /login         ┌─────────┐    Verify Creds    ┌─────────┐
│  Client │ ──────────────────────► │  Server │ ──────────────────►│Database │
│         │   {email, password}     │         │                    │         │
│         │                          │         │◄───────────────────│         │
│         │ ◄────────────────────── │         │   User Found       │         │
└─────────┘   User + JWT Tokens     └─────────┘                    └─────────┘
              ┌─────────────────────────────┐
              │ Tokens Generated:            │
              │ • Access Token (1 hour)      │
              │ • Refresh Token (7 days)     │
              └─────────────────────────────┘


3. PROTECTED REQUEST FLOW:
┌─────────┐   GET /api/endpoint     ┌─────────┐                     ┌─────────┐
│  Client │ ──────────────────────► │  Server │                     │Database │
│         │ Authorization:           │         │                     │         │
│         │ Bearer <access_token>    │         │                     │         │
│         │                          │         │                     │         │
│         │                          │ ┌─────┐ │                     │         │
│         │                          │ │JWT  │ │ Validate Token     │         │
│         │                          │ │Auth │─────────────────────►│         │
│         │                          │ └─────┘ │                     │         │
│         │                          │         │                     │         │
│         │ ◄────────────────────── │         │ ◄───────────────────│         │
└─────────┘      Response Data      └─────────┘      Query Data     └─────────┘


4. TOKEN REFRESH FLOW:
┌─────────┐  POST /api/auth/refresh ┌─────────┐                     ┌─────────┐
│  Client │ ──────────────────────► │  Server │                     │ Blacklist│
│         │ {refresh: <token>}      │         │                     │  Store   │
│         │                          │         │                     │         │
│         │                          │ ┌─────┐ │                     │         │
│         │                          │ │JWT  │ │ Validate           │         │
│         │                          │ │Auth │ │ Refresh Token      │         │
│         │                          │ └─────┘ │                     │         │
│         │                          │         │──Blacklist Old─────►│         │
│         │ ◄────────────────────── │         │                     │         │
└─────────┘  New Access Token       └─────────┘                     └─────────┘


5. LOGOUT FLOW:
┌─────────┐    POST /logout         ┌─────────┐                     ┌─────────┐
│  Client │ ──────────────────────► │  Server │                     │ Blacklist│
│         │ {refresh: <token>}      │         │                     │  Store   │
│         │                          │         │──Blacklist Token───►│         │
│         │ ◄────────────────────── │         │                     │         │
└─────────┘   Success Message       └─────────┘                     └─────────┘
```

### Token Structure

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "admin",
    "is_employee": true,
    "employee": {
      "id": 1,
      "employee_id": "EMP001",
      "full_name": "John Doe"
    }
  }
}
```

---

## API Architecture

### RESTful API Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Stateless** | Each request contains all needed information |
| **Uniform Interface** | Consistent URL patterns and HTTP methods |
| **Resource-Based** | URLs represent resources (nouns, not verbs) |
| **HTTP Methods** | Proper use of GET, POST, PUT, DELETE |
| **Status Codes** | Meaningful HTTP status codes |
| **Pagination** | Built-in pagination for list endpoints |
| **Filtering** | Query parameters for filtering |

### Request/Response Format

#### Standard Response Structure

```json
// Single Resource
{
  "id": 1,
  "employee_id": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  ...
}

// List Response (Paginated)
{
  "count": 100,
  "next": "http://api.example.com/employees?page=2",
  "previous": null,
  "results": [
    { "id": 1, ... },
    { "id": 2, ... }
  ]
}

// Error Response
{
  "error": "Invalid credentials.",
  "detail": "Email or password is incorrect"
}

// Validation Error
{
  "email": ["This field is required."],
  "password": ["Password must be at least 8 characters."]
}
```

### Middleware Stack

```
Request ──► SecurityMiddleware
              │
              ▼
           WhiteNoiseMiddleware (Static Files)
              │
              ▼
           CorsMiddleware (CORS Headers)
              │
              ▼
           SessionMiddleware
              │
              ▼
           CommonMiddleware
              │
              ▼
           CsrfViewMiddleware
              │
              ▼
           AuthenticationMiddleware
              │
              ▼
           MessageMiddleware
              │
              ▼
           XFrameOptionsMiddleware
              │
              ▼
           View Handler
```

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 1: Transport Security                                             │
│  ├── HTTPS Enforcement (Production)                                     │
│  ├── Secure Cookie Flags (HttpOnly, Secure, SameSite)                   │
│  └── CORS Policy (Whitelisted Origins)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 2: Authentication                                                │
│  ├── JWT Token Authentication                                           │
│  ├── Token Blacklisting (Logout)                                        │
│  ├── Token Expiration (Access: 1hr, Refresh: 7 days)                    │
│  └── Password Hashing (PBKDF2 + SHA256)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 3: Authorization                                                 │
│  ├── Role-Based Access Control (RBAC)                                   │
│  ├── Permission Classes (IsAuthenticated, IsAdminUser)                  │
│  └── Resource Ownership Checks                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 4: Input Validation                                              │
│  ├── Serializer Validation                                              │
│  ├── SQL Injection Prevention (ORM)                                    │
│  ├── XSS Protection (React Auto-Escaping)                              │
│  └── CSRF Protection                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 5: Data Protection                                               │
│  ├── Sensitive Data Exclusion (password in responses)                   │
│  ├── UUID Primary Keys (No sequential ID guessing)                      │
│  └── Token-Based Password Reset                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Permission Classes

```python
# IsAuthenticated - User must be logged in
class IsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

# IsAdminUser - User must be admin
class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_admin()

# Permission Matrix
┌──────────────────┬────────────┬────────────┬────────────┐
│ Action           │ Anonymous  │ User       │ Admin      │
├──────────────────┼────────────┼────────────┼────────────┤
│ Login/Register   │ ✓          │ ✓          │ ✓          │
│ View Profile     │ ✗          │ ✓          │ ✓          │
│ List Employees   │ ✗          │ ✓          │ ✓          │
│ Create Employee  │ ✗          │ ✗          │ ✓          │
│ Update Employee  │ ✗          │ ✗          │ ✓          │
│ Delete Employee  │ ✗          │ ✗          │ ✓          │
│ Check In/Out     │ ✗          │ Self Only  │ ✓          │
│ View Attendance  │ ✗          │ Self Only  │ ✓          │
│ Edit Attendance  │ ✗          │ ✗          │ ✓          │
│ Create Leave     │ ✗          │ Self Only  │ ✓          │
│ Approve Leave    │ ✗          │ ✗          │ ✓          │
└──────────────────┴────────────┴────────────┴────────────┘
```

---

## Deployment Architecture

### Production Deployment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION ENVIRONMENT                           │
└─────────────────────────────────────────────────────────────────────────┘

                           ┌─────────────┐
                           │    Users    │
                           └──────┬──────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Vercel CDN (Frontend)  │
                    │  your-app.vercel.app    │
                    │                         │
                    │  • React Build (Static) │
                    │  • Global CDN           │
                    │  • Auto SSL             │
                    └───────────┬─────────────┘
                                │
                                │ HTTPS / API Calls
                                ▼
                    ┌─────────────────────────┐
                    │  Render (Backend)       │
                    │  your-api.onrender.com  │
                    │                         │
                    │  • Django + Gunicorn    │
                    │  • WhiteNoise           │
                    │  • Auto SSL             │
                    └───────────┬─────────────┘
                                │
                                │ PostgreSQL Connection
                                ▼
                    ┌─────────────────────────┐
                    │  Render PostgreSQL      │
                    │  (Managed Database)     │
                    │                         │
                    │  • Auto Backups         │
                    │  • Connection Pooling   │
                    │  • SSL Connections      │
                    └─────────────────────────┘
```

### Environment Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│                     Environment Variables                        │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Render):                                               │
│  ├── SECRET_KEY=your-django-secret-key                          │
│  ├── DEBUG=False                                                │
│  ├── DATABASE_URL=postgres://user:pass@host/db                  │
│  ├── ALLOWED_HOSTS=your-api.onrender.com                        │
│  ├── FRONTEND_URL=https://your-app.vercel.app                   │
│  ├── EMAIL_HOST_USER=your-email@gmail.com                       │
│  ├── EMAIL_HOST_PASSWORD=your-app-password                      │
│  └── SUPERADMIN_SETUP_SECRET=your-secret                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Vercel):                                              │
│  └── VITE_API_URL=https://your-api.onrender.com/api             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Employee Check-In Flow

```mermaid
sequenceDiagram
    participant E as Employee
    participant F as Frontend
    participant A as API Server
    participant D as Database

    E->>F: Click "Check In"
    F->>F: Get employee ID from context
    F->>A: POST /api/attendance/check_in/
    Note over F,A: Authorization: Bearer <token>
    A->>A: Validate JWT Token
    A->>A: Check Permission
    A->>D: Query today's attendance
    D-->>A: No record found
    A->>D: Create attendance record
    Note over A,D: check_in = current_time<br/>status = 'present'
    D-->>A: Record created
    A-->>F: Return attendance data
    F-->>E: Show "Checked In" status
```

### Leave Request Approval Flow

```mermaid
sequenceDiagram
    participant Emp as Employee
    participant F as Frontend
    participant A as API Server
    participant D as Database
    participant Admin as Admin

    Emp->>F: Submit leave request
    F->>A: POST /api/leave-requests/
    A->>D: Create leave request
    Note over A,D: status = 'pending'
    D-->>A: Request created
    A-->>F: Success response
    
    Note over F,Admin: Later...Admin reviews
    
    Admin->>F: View pending requests
    F->>A: GET /api/leave-requests/?status=pending
    A->>D: Query pending requests
    D-->>A: Return requests
    A-->>F: List of requests
    
    Admin->>F: Click "Approve"
    F->>A: POST /api/leave-requests/{id}/approve/
    A->>A: Verify admin role
    A->>D: Update request
    Note over A,D: status = 'approved'<br/>reviewed_by = admin<br/>reviewed_at = now
    D-->>A: Updated
    A-->>F: Approved response
    F-->>Admin: Show "Approved" badge
```

---

## Scalability Considerations

### Current Architecture Limits

| Component | Limit | Mitigation |
|-----------|-------|------------|
| **Database** | Single instance | Read replicas, connection pooling |
| **API Server** | Stateless (scales horizontally) | Load balancer, multiple instances |
| **Static Files** | CDN (Vercel) | Already scalable |

### Scaling Strategies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FUTURE SCALING ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │  Users      │
                              └──────┬──────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │    Load Balancer       │
                        │    (AWS ALB / GCP)     │
                        └───────────┬────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌─────────┐    ┌─────────┐    ┌─────────┐
              │ API     │    │ API     │    │ API     │
              │Instance │    │Instance │    │Instance │
              │   #1    │    │   #2    │    │   #3    │
              └────┬────┘    └────┬────┘    └────┬────┘
                   │              │              │
                   └──────────────┼──────────────┘
                                  │
                                  ▼
                        ┌────────────────────────┐
                        │   Connection Pooler    │
                        │   (PgBouncer)          │
                        └───────────┬────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌─────────┐    ┌─────────┐    ┌─────────┐
              │ Primary │    │  Read   │    │  Read   │
              │   DB    │───►│ Replica │    │ Replica │
              └─────────┘    └─────────┘    └─────────┘
```

### Recommended Improvements

| Area | Recommendation |
|------|----------------|
| **Caching** | Add Redis for session cache, API response cache |
| **Background Tasks** | Celery for email sending, report generation |
| **Monitoring** | Add APM (New Relic, Datadog) |
| **Logging** | Centralized logging (ELK Stack) |
| **Rate Limiting** | Add django-ratelimit |
| **API Versioning** | Version the API (/api/v1/, /api/v2/) |

---

## Summary

The AttendEase architecture follows modern web application best practices:

- **Separation of Concerns**: Frontend and backend are decoupled
- **RESTful API**: Clean, documented API endpoints
- **JWT Authentication**: Stateless, scalable auth system
- **RBAC**: Role-based access control for security
- **PostgreSQL**: Reliable relational database
- **Cloud Deployment**: Vercel + Render for scalability

This architecture provides a solid foundation for a production-grade employee attendance management system with room for future enhancements and scaling.

---

*Document Version: 1.0*  
*Last Updated: 2026*