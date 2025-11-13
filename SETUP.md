# Quick Setup Guide

Follow these steps to get the CFMS up and running:

## 1. MongoDB Atlas (5 minutes)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a **FREE** cluster (M0 tier)
3. Create a database user:
   - Username: `cfms_admin`
   - Password: Generate a secure password (save it!)   googlebaba12
4. Add IP Address: Click "Add IP Address" → "Allow Access from Anywhere" (for development)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Example: mongodb+srv://cfms_admin:googlebaba12@cluster0.pwcviq8.mongodb.net/?appName=Cluster0
   - Replace `<password>` with your actual password

## 2. Backend Setup (3 minutes)

```bash
# Open terminal in backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Create .env file (Windows)
copy env-example.txt .env
# Mac/Linux
cp env-example.txt .env

# Edit .env file - add your MongoDB URI
# Open .env and paste:
MONGODB_URI=mongodb+srv://cfms_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cfms?retryWrites=true&w=majority
JWT_SECRET_KEY=your-super-secret-key-123456789-change-in-production

# Run backend
python app.py
```

You should see: "Connected to MongoDB successfully!" and "Running on http://0.0.0.0:5000"

## 3. Frontend Setup (2 minutes)

Open a **NEW terminal** (keep backend running!):

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

You should see the app at http://localhost:3000

## 4. First Login (1 minute)

1. Go to http://localhost:3000
2. Click "Register as Admin"
3. Click "Don't have an account? Register here"
4. Fill in:
   - Name: Your Name
   - Email: admin@cfms.com
   - Password: (use a secure password)
   - Click "Create Account"

You're now logged in as an admin!

## 5. Testing the System

### As Admin:
1. Register a regular user (switch to "Register as User")
2. Go to Admin Dashboard → see stats and data
3. Go to User Management → see all users
4. Go to Feedback Insights → see analytics

### As Regular User:
1. Logout from admin
2. Login as your regular user
3. Go to "Submit" → create a complaint or feedback
4. Go to "My Tickets" → see your submissions

## Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed: `python --version`
- Make sure virtual environment is activated (you should see `(venv)` in terminal)
- Check .env file exists and has correct MongoDB URI

### Can't connect to MongoDB
- Check your IP is added to Atlas whitelist
- Verify username and password in connection string
- Make sure cluster is fully created (may take 3-5 minutes)

### Frontend won't start
- Make sure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and try `npm install` again
- Check port 3000 is not in use

### CORS errors in browser
- Make sure backend is running on port 5000
- Check backend terminal for errors
- Restart both frontend and backend

### Can't login
- Make sure you registered first
- Check backend terminal for errors
- Verify MongoDB connection is working

## Common Commands

### Backend
```bash
# Start server
python app.py

# Stop server
Ctrl+C

# Reinstall packages
pip install -r requirements.txt --force-reinstall
```

### Frontend
```bash
# Start dev server
npm run dev

# Stop server
Ctrl+C

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Build for production
npm run build
```

## Next Steps

1. **Read README.md** for detailed documentation
2. **Explore the code** - all components are in `frontend/src/components/`
3. **Customize** - modify styles, add features, etc.
4. **Deploy** - when ready, deploy to Heroku (backend) and Vercel (frontend)

## Support

If you get stuck:
1. Check the README.md
2. Look at backend terminal for error messages
3. Check browser console (F12) for frontend errors
4. Verify both servers are running
5. Verify MongoDB Atlas cluster is running

Happy coding! 🚀

