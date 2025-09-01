# HD Notes App

A simple note-taking app where users can sign up, verify their email, and manage their personal notes.

## What's Inside

- **Frontend**: React app with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express and MongoDB
- **Authentication**: Email/OTP verification and JWT tokens
- **Features**: Create, view, and delete notes

## Getting Started

### Prerequisites

Make sure you have these installed:
- Node.js (version 16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Local Development Setup

1. **Clone and navigate to the project**
   ```bash
   cd Task
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend folder:
   ```
   MONGODB_URI=mongodb://localhost:27017/noteapp
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   GOOGLE_CLIENT_ID=your-google-client-id
   EXPOSE_DEV_OTP=true
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on http://localhost:5000

3. **Frontend Setup**
   
   Open a new terminal and:
   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file in the frontend folder:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   VITE_API_URL=http://localhost:5000
   ```

   Start the frontend:
   ```bash
   npm run dev
   ```
   The app will open at http://localhost:5173

## Production Deployment

### Backend Deployment (Render)

1. **Connect your GitHub repository to Render**
2. **Configure Environment Variables in Render Dashboard:**
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-production-jwt-secret
   PORT=5000
   NODE_ENV=production
   CLIENT_ORIGIN=https://assignment-sandy-pi.vercel.app
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   GOOGLE_CLIENT_ID=your-google-client-id
   EXPOSE_DEV_OTP=false
   ```
3. **Build Command:** `npm run build`
4. **Start Command:** `npm start`
5. **Root Directory:** `backend`

### Frontend Deployment (Vercel)

1. **Connect your GitHub repository to Vercel**
2. **Configure Environment Variables in Vercel Dashboard:**
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   VITE_API_URL=https://assignment-xxd3.onrender.com
   ```
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Root Directory:** `frontend`

## How to Use

1. **Sign Up**: Enter your name, email, and date of birth
2. **Verify Email**: Check your email for the OTP code (or check console in development)
3. **Dashboard**: Once logged in, you can create and delete notes
4. **Sign Out**: Use the sign out button to log out

## Project Structure

```
Task/
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Auth and validation
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Main pages
│   │   ├── services/      # API calls
│   │   └── hooks/         # Custom hooks
│   └── package.json
└── README.md
```

## Notes

- The app works best on mobile screen sizes
- Email sending requires proper SMTP configuration
- In development, OTP codes are shown in the console
- MongoDB must be running before starting the backend

## Troubleshooting

- **Can't connect to MongoDB**: Make sure MongoDB is running and the connection string is correct
- **Email not sending**: Check your email credentials in the .env file
- **Port already in use**: Change the port in the backend or stop the process using that port

That's it! The app should be working now.
