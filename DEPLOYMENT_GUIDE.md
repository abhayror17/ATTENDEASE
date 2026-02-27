# AttendEase - Deployment Guide (FastAPI)

> **Repository:** https://github.com/abhayror17/ATTENDEASE

## Overview

This guide will help you deploy the Employee Attendance System to the cloud.

**Deployment Stack:**
| Service | Purpose | Tier |
|---------|---------|------|
| Render | Backend API (FastAPI) + PostgreSQL | Free |
| Vercel | Frontend (React) | Free |

---

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Git installed locally

---

## Part 1: Push Code to GitHub

```powershell
git add .
git commit -m "Migrate to FastAPI with layered architecture"
git push origin main
```

---

## Part 2: Deploy Backend to Render

### Step 1: Create PostgreSQL Database

1. From Render Dashboard, click "New +" -> "PostgreSQL"
2. Configure:
   - **Name**: `attendease-db`
   - **Database**: `attendease_db`
   - **Region**: Choose closest to you
   - **Instance Type**: Free
3. Click "Create Database"
4. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 2: Deploy FastAPI Backend

1. From Render Dashboard, click "New +" -> "Web Service"
2. Connect GitHub -> Select your repository
3. Configure:
   - **Name**: `attendease-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

4. Add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
   | `DEBUG` | `False` |
   | `DATABASE_URL` | (paste Internal Database URL) |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` |
   | `SUPERADMIN_SETUP_SECRET` | Generate a secure random string |
   | `SUPERADMIN_EMAIL` | `admin@example.com` |
   | `SUPERADMIN_USERNAME` | `admin` |
   | `SUPERADMIN_PASSWORD` | `YourSecurePassword123` |
   | `TIMEZONE` | `Asia/Kolkata` |

5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment

### Step 3: Verify Backend

1. Visit: `https://attendease-backend-xxxx.onrender.com/api/docs`
2. You should see the FastAPI Swagger documentation
3. The superuser will be created automatically during build

**Backend is live!**

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Deploy to Vercel

1. From Vercel Dashboard, click "Add New..." -> "Project"
2. Import your repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://attendease-backend-xxxx.onrender.com/api` |

5. Click "Deploy"

### Step 2: Update Backend CORS

1. Go to Render -> Backend service -> Environment
2. Update `FRONTEND_URL` with your Vercel URL
3. Save Changes (service will auto-redeploy)

**Frontend is live!**

---

## Part 4: Local Development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Copy .env.example to .env and configure
copy .env.example .env

# Initialize database
python -m app.scripts.db_init seed

# Create superuser
python -m app.scripts.db_init superuser --email admin@example.com --username admin --password Admin@123

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Your Live URLs

```
Backend API:     https://attendease-backend-xxxx.onrender.com
API Docs:        https://attendease-backend-xxxx.onrender.com/api/docs
Frontend:        https://employee-attendance-system-xxxx.vercel.app
```

---

## Environment Variables Summary

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | JWT secret key |
| `DEBUG` | Yes | Set to `False` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `FRONTEND_URL` | Yes | Vercel frontend URL for CORS |
| `SUPERADMIN_SETUP_SECRET` | Yes | Secret for initial admin creation |
| `SUPERADMIN_EMAIL` | Yes | Admin email |
| `SUPERADMIN_USERNAME` | Yes | Admin username |
| `SUPERADMIN_PASSWORD` | Yes | Admin password |
| `TIMEZONE` | No | Default: `Asia/Kolkata` |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL with `/api` suffix |

---

## Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check Render logs
- Verify `DATABASE_URL` is correct
- Check `SECRET_KEY` is set

**"502 Bad Gateway"**
- Service is cold starting - wait 30 seconds
- Verify start command is correct

### Frontend Issues

**"CORS errors"**
- Verify `FRONTEND_URL` matches your Vercel URL
- Check `VITE_API_URL` ends with `/api`

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created on Render
- [ ] Backend deployed with correct start command
- [ ] API docs accessible at `/api/docs`
- [ ] Superuser created automatically
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Complete functionality tested

**Your Employee Attendance System is now live!**