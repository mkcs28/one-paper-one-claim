# One Paper One Claim — Full Stack Setup Guide

## Project Structure

```
one-paper-one-claim/
  ├── src/                  ← React frontend (Vite)
  ├── server/               ← Node.js + Express backend
  │   ├── index.js          ← Main server file
  │   ├── models/
  │   │   ├── Paper.js      ← MongoDB Paper schema
  │   │   └── Message.js    ← MongoDB Message schema
  │   ├── mailer.js         ← Nodemailer email service
  │   ├── package.json
  │   └── .env              ← Server secrets (fill this in)
  ├── .env                  ← Frontend env (VITE_API_URL)
  ├── package.json
  └── vite.config.js
```

---

## Step 1 — MongoDB Atlas (Free Tier)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up free
2. Create a new **Project** → click **Build a Database** → choose **M0 Free**
3. Choose a cloud provider (AWS recommended) and region closest to you
4. Set a **Username** and **Password** — save them
5. Under **Network Access** → Add IP Address → click **Allow Access from Anywhere** (0.0.0.0/0)
6. Go to **Database** → click **Connect** → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `<password>` with your actual password and add the database name:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/opoc?retryWrites=true&w=majority
```

---

## Step 2 — Gmail App Password (for sending emails)

1. Use a Gmail account
2. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
3. Enable **2-Step Verification** if not already done
4. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
5. Select **Mail** and **Windows Computer** → click **Generate**
6. Copy the 16-character password shown

---

## Step 3 — Configure server/.env

Open `server/.env` and fill in your values:

```env
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/opoc?retryWrites=true&w=majority
MAIL_USER=yourgmail@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx
MAIL_FROM_NAME=One Paper One Claim Portal
PORT=5000
ALLOWED_DOMAIN=jssstuniv.in
CLIENT_ORIGIN=http://localhost:5173
```

---

## Step 4 — Install & Run

### Terminal 1 — Backend

```bash
cd one-paper-one-claim/server
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### Terminal 2 — Frontend

```bash
cd one-paper-one-claim
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## What the Backend Does

| Endpoint | Method | Description |
|---|---|---|
| `/api/papers` | POST | Submit paper — validates domain, checks duplicates, saves to MongoDB, sends email ack |
| `/api/papers` | GET | Fetch all papers (with optional `?q=`, `?type=`, `?dept=` filters) |
| `/api/papers/count` | GET | Get total paper count (used for live home counter) |
| `/api/contact` | POST | Submit contact message — saves to MongoDB, sends email ack |
| `/api/health` | GET | Server health check |

---

## Features

- **@jssstuniv.in only** — Both frontend and backend reject any other email domain
- **Duplicate detection** — Same paper title + same author name (case-insensitive) is blocked with a custom UI error dialog
- **Acknowledgement emails** — Both paper submission and contact messages send styled HTML emails with unique ack numbers
- **Live paper count** — Home page stat card fetches from MongoDB every 30 seconds
- **Live search** — Search page queries MongoDB directly with 400ms debounce
- **PDF upload** — Server validates PDF type and 2MB limit via multer

---

## Production Deployment

### Backend (e.g. Render.com free tier)
1. Push your `server/` folder to GitHub
2. On Render → New Web Service → connect repo
3. Set environment variables from `.env`
4. Build command: `npm install`  |  Start command: `npm start`
5. Copy the deployed URL (e.g. `https://opoc-server.onrender.com`)

### Frontend (e.g. Vercel)
1. Update `one-paper-one-claim/.env`:
   ```
   VITE_API_URL=https://opoc-server.onrender.com
   ```
2. Push to GitHub → deploy on Vercel
3. In `vite.config.js` proxy is only needed for local dev — Vercel uses VITE_API_URL

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoServerError: bad auth` | Check username/password in MONGO_URI |
| `Invalid login: 535 Credentials` | Check Gmail App Password, not your regular password |
| `CORS error` in browser | Check `CLIENT_ORIGIN` in server `.env` matches your frontend URL |
| Email not received | Check spam folder; verify App Password is correct |
| `ECONNREFUSED` on frontend | Make sure backend server is running on port 5000 |
