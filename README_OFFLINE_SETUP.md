# DEALFLOW360 - Offline Local Database & Setup Guide

This guide explains how to run **DEALFLOW360** completely offline without an internet connection using local MongoDB and `.env` configuration.

---

## 📁 Environment Variables Configured (`.env`)

### Backend Environment: [`server/.env`](file:///c:/Users/ygupt/OneDrive/Desktop/Dealflow/server/.env)
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/dealflow360
JWT_SECRET=dealflow360_super_secret_jwt_key_2026
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend Environment: [`client/.env`](file:///c:/Users/ygupt/OneDrive/Desktop/Dealflow/client/.env)
```env
VITE_API_BASE_URL=http://localhost:5001
```

---

## 🍃 Local Offline MongoDB Options

The application connects to `mongodb://127.0.0.1:27017/dealflow360` by default.

### Option A: Standard Local MongoDB Community Edition
1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally.
2. Start the local MongoDB service (default port `27017`).
3. To seed/reset demo data manually, run:
   ```bash
   cd server
   npm run seed
   ```

### Option B: Automatic Memory Store Fallback (Zero Setup)
If MongoDB service is not running locally, **DEALFLOW360** automatically runs with a built-in mock memory database, allowing full offline presentation without installing MongoDB!

---

## 🚀 How to Run Offline

### 1. Launching the App (1-Click)
On Windows, simply double-click [`run-offline.bat`](file:///c:/Users/ygupt/OneDrive/Desktop/Dealflow/run-offline.bat) or run:

**Backend Server:**
```bash
cd server
npm start
```

**Frontend App:**
```bash
cd client
npm run dev
```

### 2. Accessing the Platform
Open your browser to:
**`http://localhost:3000`**

Use the **Demo Suite / Role Switcher** dropdown in the top header bar to switch instantly between all 6 user roles (**Client**, **Sales Rep**, **Sales Manager**, **Finance**, **Factory/Operations**, **Admin**).
