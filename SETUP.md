# 📦 SETUP GUIDE — Smart Complaint Management System

This guide walks you through everything: MongoDB Atlas, OpenRouter API, local development, and Render deployment.

---

## 📋 Prerequisites

- Node.js v18+ installed → https://nodejs.org
- Git installed → https://git-scm.com
- A free account on:
  - [MongoDB Atlas](https://cloud.mongodb.com)
  - [OpenRouter](https://openrouter.ai)
  - [Render](https://render.com)
  - [GitHub](https://github.com)

---

## STEP 1 — Set Up MongoDB Atlas (Free)

### 1.1 Create Account & Cluster
1. Go to https://cloud.mongodb.com
2. Click **"Try Free"** → Sign up with Google or Email
3. Choose **"Free"** plan (M0 Sandbox — always free)
4. Select a cloud provider (AWS) and region nearest to you
5. Click **"Create Cluster"** (takes ~2 mins)

### 1.2 Create a Database User
1. In the left sidebar → **Database Access**
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `complaintAdmin` (or any name)
5. Password: Click **"Autogenerate"** → copy and save the password
6. Role: **"Atlas admin"**
7. Click **"Add User"**

### 1.3 Whitelist Your IP
1. Left sidebar → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** → `0.0.0.0/0`
   - ⚠️ This is needed for Render deployment
4. Click **"Confirm"**

### 1.4 Get Your Connection String
1. Left sidebar → **Database** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://complaintAdmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password you saved
6. Add your database name before the `?`:
   ```
   mongodb+srv://complaintAdmin:yourpassword@cluster0.xxxxx.mongodb.net/complaint-db?retryWrites=true&w=majority
   ```
7. **Save this full string** — you'll put it in `MONGO_URI`

---

## STEP 2 — Set Up OpenRouter API (Free Credits Available)

OpenRouter gives access to many AI models including free ones.

### 2.1 Create Account
1. Go to https://openrouter.ai
2. Click **"Sign In"** → use Google or GitHub
3. Complete email verification if required

### 2.2 Get API Key
1. Go to https://openrouter.ai/keys
2. Click **"Create Key"**
3. Name it: `complaint-system`
4. Click **"Create"**
5. **Copy the key immediately** — it starts with `sk-or-v1-...`
   - ⚠️ You won't be able to see it again

### 2.3 Add Free Credits (Optional)
- New accounts get some free credits
- Go to https://openrouter.ai/credits to add more if needed
- The `mistralai/mistral-7b-instruct:free` model is completely free with rate limits

### 2.4 Verify the Model Used
The backend uses `mistralai/mistral-7b-instruct:free` by default.
You can change it in `backend/controllers/aiController.js` line ~10.

Other free models on OpenRouter:
- `meta-llama/llama-3.2-3b-instruct:free`
- `google/gemma-3-4b-it:free`
- `qwen/qwen3-8b:free`

---

## STEP 3 — Local Development Setup

### 3.1 Backend Setup
```bash
cd backend

# Copy env file
cp .env.example .env

# Edit .env with your values
nano .env   # or use any text editor
```

Fill in your `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://complaintAdmin:yourpassword@cluster0.xxxxx.mongodb.net/complaint-db?retryWrites=true&w=majority
JWT_SECRET=mySecretKey_ChangeThis_To_Something_Long_Random_2024
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```bash
# Install dependencies
npm install

# Start in development mode (auto-restart on changes)
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Server running on port 5000
```

### 3.2 Frontend Setup
```bash
cd frontend

# Copy env file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## STEP 4 — Push to GitHub

```bash
# In the root of smart-complaint-system/
git init
git add .
git commit -m "Initial commit: AI Smart Complaint Management System"

# Create a new repo on GitHub → copy the remote URL
git remote add origin https://github.com/yourusername/smart-complaint-system.git
git branch -M main
git push -u origin main
```

---

## STEP 5 — Deploy Backend on Render

### 5.1 Create Web Service
1. Go to https://render.com → **Sign Up / Log In**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → select your repository
4. Configure:
   - **Name**: `smart-complaint-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 5.2 Add Environment Variables
In the Render dashboard under **Environment**:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `MONGO_URI` | your full MongoDB connection string |
| `JWT_SECRET` | a long random string |
| `OPENROUTER_API_KEY` | your OpenRouter key |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | your Render frontend URL (add after deploying frontend) |

5. Click **"Create Web Service"**
6. Wait for deployment (~3-5 minutes)
7. Note your backend URL: `https://smart-complaint-backend.onrender.com`

---

## STEP 6 — Deploy Frontend on Render

### 6.1 Create Static Site
1. Click **"New +"** → **"Static Site"**
2. Select the same repository
3. Configure:
   - **Name**: `smart-complaint-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 6.2 Add Environment Variable
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://smart-complaint-backend.onrender.com/api` |

4. Click **"Create Static Site"**
5. Note your frontend URL: `https://smart-complaint-frontend.onrender.com`

### 6.3 Update Backend CORS
Go back to your backend Render service → Environment → update:
```
FRONTEND_URL = https://smart-complaint-frontend.onrender.com
```

---

## STEP 7 — Testing with Postman / Thunder Client

### Import these test requests:

**1. Register User**
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Rahul Kumar",
  "email": "rahul@gmail.com",
  "password": "password123"
}
```

**2. Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "rahul@gmail.com",
  "password": "password123"
}
```
→ Copy the `token` from response

**3. Add Complaint** (use token in Authorization: Bearer <token>)
```
POST http://localhost:5000/api/complaints
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Rahul Kumar",
  "email": "rahul@gmail.com",
  "title": "Water Leakage Issue",
  "description": "Water pipeline is damaged near the main market area causing waterlogging.",
  "category": "Water Supply",
  "location": "Ghaziabad"
}
```
→ Copy the `_id` from response

**4. Run AI Analysis**
```
POST http://localhost:5000/api/ai/analyze
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "complaintId": "<complaint _id>"
}
```

**5. Get All Complaints**
```
GET http://localhost:5000/api/complaints
Authorization: Bearer <your_token>
```

**6. Search by Location**
```
GET http://localhost:5000/api/complaints/search?location=Ghaziabad
Authorization: Bearer <your_token>
```

**7. Update Status**
```
PUT http://localhost:5000/api/complaints/<id>
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "status": "In Progress"
}
```

---

## STEP 8 — Create Admin User

To get admin access, sign up normally then manually update in MongoDB:

1. Go to MongoDB Atlas → **Browse Collections** → `users`
2. Find your user document
3. Click **Edit** → change `"role": "user"` to `"role": "admin"`
4. Save

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| MongoDB connection refused | Check MONGO_URI, whitelist `0.0.0.0/0` in Atlas |
| OpenRouter 401 error | Check OPENROUTER_API_KEY in .env |
| CORS error on frontend | Add your frontend URL to backend CORS & FRONTEND_URL env var |
| Render free tier spins down | First request after inactivity takes ~30s — this is normal |
| JWT errors | Make sure JWT_SECRET is same in all environments |
| Vite env vars not working | Must start with `VITE_` prefix |

---

## 📁 Folder Structure Reference

```
smart-complaint-system/
├── README.md
├── SETUP.md                    ← This file
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js               ← Entry point
│   ├── config/
│   │   └── db.js               ← MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   ← signup, login, profile
│   │   ├── complaintController.js
│   │   └── aiController.js     ← OpenRouter integration
│   ├── middleware/
│   │   ├── authMiddleware.js   ← JWT protect, adminOnly
│   │   └── errorHandler.js     ← Global error handler
│   ├── models/
│   │   ├── User.js             ← User schema
│   │   └── Complaint.js        ← Complaint schema with AI fields
│   └── routes/
│       ├── authRoutes.js
│       ├── complaintRoutes.js
│       └── aiRoutes.js
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx             ← Routes
        ├── index.css           ← Global styles
        ├── components/
        │   └── Navbar.jsx
        ├── context/
        │   └── AuthContext.jsx ← Auth state management
        ├── pages/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Dashboard.jsx
        │   ├── RegisterComplaint.jsx
        │   ├── ComplaintList.jsx
        │   └── ComplaintDetail.jsx
        └── utils/
            └── api.js          ← All Axios API calls
```
