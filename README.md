# 🔐 VaultX

A secure, full-stack cloud storage platform — inspired by Google Drive — built with the MERN stack. Includes email/OTP verification, an admin-approval workflow for new accounts, and a full admin control panel.

---

## ✨ Features

### User side
- Signup with email + OTP verification (Nodemailer)
- Accounts require **admin approval** before they can log in
- JWT-based authentication
- Upload, star/unstar, and soft-delete (trash) files
- Restore or permanently delete files from trash
- Per-user storage limit (1 GB) with real-time usage tracking

### Admin side
- Separate admin login (email + admin ID + password + global password — all set via `.env`, no admin DB record needed)
- Dashboard with live stats: total users, pending requests, total storage used
- Approve / reject pending signup requests
- Full user management: view all users with storage usage, add a user manually, or delete a user (and their files)

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS 4
- React Router v7
- React Hook Form + React Toastify
- Lucide Icons

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- Redis (OTP session storage)
- JWT for authentication
- Multer for file uploads
- Nodemailer for OTP emails
- bcrypt for password hashing

---

## 📁 Project Structure

```
VaultX/
├── Backend/
│   ├── Controller/       # Route handlers (Auth, Files, Admin, Upload, Home)
│   ├── Database/         # Mongoose models
│   ├── Middleware/       # JWT auth, admin auth, storage limit checks
│   ├── Redish/           # Redis connection
│   ├── Route/            # Express routers
│   ├── Utils/            # Storage helpers
│   ├── uploads/          # User-uploaded files (gitignored)
│   ├── trash/            # Soft-deleted files (gitignored)
│   └── app.js            # Entry point
└── frontend/
    └── src/
        ├── Component/     # Shared UI (Header, AdminLayout, etc.)
        ├── Pages/         # Route-level pages (Login, Signup, Admin pages, etc.)
        └── utils/         # Formatting helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- MongoDB running locally (or a connection string)
- Redis running locally (or a connection string)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for sending OTP emails

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/VaultX.git
cd VaultX
```

### 2. Backend setup
```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/`:
```env
PORT=8080
MONGO=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
JWT_SECRET=your-jwt-secret

# Admin login — all four must match to log in as admin
ADMIN_EMAIL=admin@example.com
ADMIN_ID=admin001
ADMIN_PASSWORD=your-admin-password
GLOBAL_PASSWORD=your-global-password
```

Run the backend:
```bash
npm start
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, and the API at `http://localhost:8080`.

---

## 🔑 Admin Access

Go to `/admin/login` (or click **"🛡️ Login as Admin"** on the regular login page) and sign in with the four credentials set in your `.env` file. From there you can approve new signups and manage all users from `/admin/dashboard` and `/admin/users`.

---

## 📄 License

This project is for personal/educational use. Feel free to fork and build on it.
