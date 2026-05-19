# 🏛️ Smart Complaint Management System

AI-powered MERN Stack complaint management system with JWT auth, MongoDB, and OpenRouter AI integration.

## Features
- 📝 Complaint registration & tracking
- 🤖 AI-based priority detection, department recommendation, summary & auto-response
- 🔐 JWT authentication with bcrypt password hashing
- 👮 Admin & user role management
- 📊 Dashboard with complaint statistics
- 🔍 Filter & search complaints by location/category/status
- 🚀 Deployable on Render

## Tech Stack
- **Frontend**: React 18, Vite, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **AI**: OpenRouter API (Mistral 7B)
- **Auth**: JWT + bcryptjs

## Quick Start
See `SETUP.md` for full instructions.

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend  
cd frontend && npm install && npm run dev
```

## Project Structure
```
smart-complaint-system/
├── backend/
│   ├── config/        → MongoDB connection
│   ├── controllers/   → Business logic
│   ├── middleware/    → Auth & error handlers
│   ├── models/        → Mongoose schemas
│   ├── routes/        → API routes
│   └── server.js      → Entry point
└── frontend/
    └── src/
        ├── components/ → Navbar
        ├── context/    → Auth context
        ├── pages/      → All pages
        └── utils/      → Axios API helpers
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/profile | Get profile |
| POST | /api/complaints | Add complaint |
| GET | /api/complaints | Get all complaints |
| GET | /api/complaints/:id | Get one complaint |
| PUT | /api/complaints/:id | Update status |
| DELETE | /api/complaints/:id | Delete (admin) |
| GET | /api/complaints/search?location=X | Search by location |
| POST | /api/ai/analyze | Run AI analysis |
| GET | /api/ai/analyze/:id | Get analysis |
