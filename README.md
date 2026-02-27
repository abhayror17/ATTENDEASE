# AttendEase

<div align="center">

<<<<<<< HEAD
**A Modern Employee Attendance Management System**
=======
If the app doesn’t log in immediately, please wait a few minutes — the backend services are hosted on Render and may take a short time to spin up.
[Future/Update
](https://docs.google.com/document/d/1xoTrx__FpnH0ohU-g_tYSZecc584nIGxhAsfkumzsXc/edit?usp=sharing)

EMAIL -- admin@attendease.com
PASS -- Admin@123
---
>>>>>>> b7c16e3629eb9f0c6cb2f7b070682c66c75522ee

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://attendease-xi-two.vercel.app)
[![Backend](https://img.shields.io/badge/backend-fastapi-009688?style=for-the-badge)](https://attendease-pazn.onrender.com/api/docs)
[![Frontend](https://img.shields.io/badge/frontend-react-61DAFB?style=for-the-badge&logo=react)](https://attendease-xi-two.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

*If the app doesn't log in immediately, please wait a few minutes - the backend services are hosted on Render and may take time to spin up.*

<<<<<<< HEAD
</div>
=======
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e8a51929-4b3d-4e46-8f3e-dd06bb1a00e2" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6fbb48d5-e9d8-4cee-8023-c2620cabad9b" />


**Tech Stack:**

* **Backend:** Django (Python)
* **Database:** PostgreSQL
* **Frontend:** React
* **Backend & DB Hosting:** Render
* **Frontend Hosting:** Vercel

AI models used during development:

* Backend logic assistance: GLM-5
* Frontend structuring: Gemini 3 Flash

* Backend link -- [https://attendease-backend-x9uq.onrender.com](https://attendease-pazn.onrender.com)
* Frontend link -- https://attendease-xi-two.vercel.app

This wasn’t just about building features — it was about building a scalable system architecture.
>>>>>>> b7c16e3629eb9f0c6cb2f7b070682c66c75522ee

---

## Overview

AttendEase is a full-stack HR Management System designed with **role-based architecture** at its core. The platform provides two distinct user experiences within a single application:

| Portal | Users | Capabilities |
|--------|-------|--------------|
| **Admin Portal** | HR Managers, Administrators | Full workforce management, attendance tracking, leave approvals, department control |
| **Employee Portal** | Regular Employees | Personal check-in/out, leave requests, attendance history |

This separation ensures enterprise-grade security, clean architecture, and scalable design.

---

## Features

### Admin Portal

| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time analytics with attendance trends, distribution charts, and workforce statistics |
| **Employee Management** | Complete CRUD operations, department assignment, user linking, status tracking |
| **Attendance Control** | Daily overview, manual check-in/out, status overrides, working hours calculation |
| **Leave Management** | Approve/reject requests with comments, filter by status and type |
| **Department Management** | Create, edit, delete departments with employee count tracking |

### Employee Portal

| Feature | Description |
|---------|-------------|
| **Dashboard** | Personal attendance stats, recent activity history |
| **Check-In/Out** | One-click attendance marking with real-time status display |
| **Leave Requests** | Submit requests, select leave type, track approval status |

---

## Screenshots

### Authentication

<div align="center">

**Login Page**

![Login](frontend/public/screenshots/login.png)

**Register Page**

![Register](frontend/public/screenshots/register.png)

</div>

### Dashboard

<div align="center">

**Admin Dashboard - Real-time Analytics**

![Dashboard](frontend/public/screenshots/dashboard.png)

</div>

### Core Features

<div align="center">

**Check-In/Out Interface**

![Check-In](frontend/public/screenshots/checkin.png)

**Leave Requests Management**

![Leave Requests](frontend/public/screenshots/leave-requests.png)

</div>

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite | Build tool & dev server |
| React Router | Client-side routing |
| Axios | HTTP client |
| Lucide React | Icon library |
| Context API | State management |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | Python web framework |
| SQLAlchemy | ORM |
| PostgreSQL | Production database |
| SQLite | Development database |
| JWT | Authentication |
| Bcrypt | Password hashing |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Public    │  │  Protected  │  │      Admin Routes       │  │
│  │   Routes    │  │   Routes    │  │   (Role-based Access)   │  │
│  │ ─────────── │  │ ─────────── │  │ ─────────────────────── │  │
│  │ • Login     │  │ • Dashboard │  │ • Employees             │  │
│  │ • Register  │  │ • Check-In  │  │ • Attendance            │  │
│  │ • Password  │  │ • Leaves    │  │ • Departments           │  │
│  │   Reset     │  │             │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Controllers │  │  Services   │  │     Repositories        │  │
│  │ ─────────── │  │ ─────────── │  │ ─────────────────────── │  │
│  │ • Auth      │  │ • Auth      │  │ • User                  │  │
│  │ • Employee  │  │ • Employee  │  │ • Employee              │  │
│  │ • Attendance│  │ • Attendance│  │ • Department            │  │
│  │ • Leave     │  │ • Leave     │  │                         │  │
│  │ • Department│  │ • Department│  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQLAlchemy ORM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│         PostgreSQL (Production) / SQLite (Development)          │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────────┐  │
│  │  Users    │ │ Employees │ │Attendance │ │ Leave Requests  │  │
│  └───────────┘ └───────────┘ └───────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/abhayror17/ATTENDEASE.git
cd ATTENDEASE

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Initialize database with seed data
python -m app.scripts.db_init seed

# Create superuser
python -m app.scripts.db_init superuser --email admin@example.com --username admin --password Admin@123

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Run development server
npm run dev
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/docs
- Default Admin: `admin@example.com` / `Admin@123`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | JWT secret key |
| `DATABASE_URL` | Yes | Database connection string |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `DEBUG` | No | Enable debug mode |
| `SUPERADMIN_EMAIL` | No | Admin email |
| `SUPERADMIN_USERNAME` | No | Admin username |
| `SUPERADMIN_PASSWORD` | No | Admin password |
| `TIMEZONE` | No | Default timezone |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (e.g., `http://localhost:8000/api`) |

---

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/profile` | Get current user |

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/{id}` | Get employee details |
| POST | `/api/employees` | Create employee (Admin) |
| PUT | `/api/employees/{id}` | Update employee (Admin) |
| DELETE | `/api/employees/{id}` | Delete employee (Admin) |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/today` | Today's attendance |
| POST | `/api/attendance/check-in` | Check in |
| POST | `/api/attendance/check-out` | Check out |
| GET | `/api/attendance/stats` | Attendance statistics |

### Leave Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leave-requests` | List leave requests |
| POST | `/api/leave-requests` | Create leave request |
| POST | `/api/leave-requests/{id}/approve` | Approve request (Admin) |
| POST | `/api/leave-requests/{id}/reject` | Reject request (Admin) |

Full API documentation: `/api/docs` (Swagger UI)

---

## Deployment

### Backend (Render)

1. Create a PostgreSQL database on Render
2. Create a Web Service pointing to your GitHub repo
3. Set root directory to `backend`
4. Configure build command: `chmod +x build.sh && ./build.sh`
5. Configure start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (see Environment Variables section)

### Frontend (Vercel)

1. Import your GitHub repository
2. Set root directory to `frontend`
3. Set `VITE_API_URL` environment variable
4. Deploy

---

## Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                    ACCESS CONTROL MATRIX                     │
├─────────────────┬──────────────┬────────────────────────────┤
│     Resource    │   Employee   │          Admin             │
├─────────────────┼──────────────┼────────────────────────────┤
│ Dashboard       │ Own Stats    │ Full Analytics             │
│ Check-In/Out    │ Self Only    │ All Employees              │
│ Leave Requests  │ Create/View  │ Approve/Reject             │
│ Employees       │ View         │ Full CRUD                  │
│ Attendance      │ View Own     │ Manage All                 │
│ Departments     │ View         │ Full CRUD                  │
└─────────────────┴──────────────┴────────────────────────────┘
```

---

## Design System

The UI features a modern dark theme with distinctive green accents:

| Element | Value |
|---------|-------|
| Background | `#000000` |
| Surface | `#0a0a0a` |
| Primary | `#00ff00` |
| Text | `#ffffff` |
| Border | `#1f1f1f` |

Design principles:
- Dark mode for reduced eye strain
- Cyberpunk/terminal aesthetic
- Glassmorphism effects
- Smooth animations
- Responsive layout

---

## Project Structure

```
ATTENDEASE/
├── backend/
│   ├── app/
│   │   ├── controllers/     # HTTP endpoints
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── build.sh
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # React components
│   │   ├── components/      # Shared components
│   │   ├── context/         # Auth context
│   │   ├── api/             # API client
│   │   └── index.css        # Design system
│   └── package.json
│
└── README.md
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with AI assistance using GLM-5 and Gemini**

[Live Demo](https://attendease-xi-two.vercel.app) · [Report Bug](https://github.com/abhayror17/ATTENDEASE/issues) · [Request Feature](https://github.com/abhayror17/ATTENDEASE/issues)

</div>