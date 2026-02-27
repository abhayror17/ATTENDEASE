# AttendEase - Employee Attendance System

A modern, full-stack employee attendance management system built with Django and React.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 5, Django REST Framework |
| Database | PostgreSQL |
| Frontend | React 18, Vite |
| Deployment | Render (Backend), Vercel (Frontend) |

## Features

- **User Authentication** - Secure login/registration with email verification
- **Role-based Access** - Separate interfaces for admin and employees
- **Employee Management** - Add, edit, search, and manage employees
- **Department Management** - Organize employees by departments
- **Attendance Tracking** - Check-in/check-out with real-time status
- **Leave Management** - Submit, approve, and track leave requests
- **Dashboard Analytics** - Visual overview of attendance statistics

## Project Structure

```
employee-attendance-system/
├── backend/                 # Django REST API
│   ├── authentication/      # User auth & management
│   ├── employees/           # Employee & attendance models
│   ├── config/              # Django settings
│   └── templates/           # Email templates
└── frontend/                # React + Vite frontend
    └── src/
        ├── api/             # API service layer
        ├── components/      # Reusable UI components
        ├── context/         # React context (Auth)
        └── pages/           # Page components
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your database credentials

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
copy .env.example .env
# Edit .env with your API URL

npm run dev
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin
- API Docs: http://localhost:8000/api/schema/swagger-ui/

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions to Render and Vercel.

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Debug mode (True/False) |
| `DATABASE_URL` | PostgreSQL connection string |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## License

MIT License

---

*Built with Django + React. Design: Brutalism.*
