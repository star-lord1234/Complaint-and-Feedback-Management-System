# Complaint Feedback Management System (CFMS)

A full-stack web application for managing customer complaints and feedback, built with React + Vite frontend and Flask backend with MongoDB Atlas.

## Features

- **User Authentication**: Register and login for both regular users and administrators
- **Complaint Menegement**: Submit, track, and manage customer complaints  
- **Feedback System**: Collect and analyze customer feedback with ratings
- **Admin Dashboard**: Comprehensive admin panel with analytics and insights
- **Real-time Updates**: Dynamic frontend updates with backend integration
- **Role-based Access**: Separate views and permissions for users and admins

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- Recharts for data visualization
- JWT authentication

### Backend
- Flask (Python)
- Flask-JWT-Extended for authentication
- Flask-CORS for cross-origin requests
- Flask-Bcrypt for password hashing
- PyMongo for MongoDB integration
- MongoDB Atlas for cloud database

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB Atlas account (free tier available)

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (choose the free tier)
4. Create a database user with username and password
5. Add your IP address to the whitelist (or use `0.0.0.0/0` for development)
6. Click "Connect" on your cluster and copy the connection string
7. Replace `<password>` with your database user password in the connection string

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env-example.txt .env

# Edit .env file and add your MongoDB connection string and JWT secret
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cfms?retryWrites=true&w=majority
# JWT_SECRET_KEY=your-very-secure-random-string-here

# Run the backend server
python app.py
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### First Time Setup

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Register an admin account (important for accessing admin features)
4. Register regular user accounts as needed

### User Features

- **Dashboard**: View your complaint and feedback statistics
- **Submit Complaint**: Create and submit complaints with priority levels
- **Give Feedback**: Submit feedback with star ratings and comments
- **My Tickets**: Track all your complaints and feedback submissions
- **View Responses**: See admin responses to your submissions

### Admin Features

- **Admin Dashboard**: Overview of all complaints and metrics
- **Complaint Center**: Manage all complaints from all users
- **User Management**: View and manage system users
- **Feedback Insights**: Analyze feedback trends and sentiment
- **Timeline Planner**: Track resolution progress and timelines

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Complaints
- `GET /api/complaints` - Get all complaints (filtered by role)
- `GET /api/complaints/:id` - Get specific complaint
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/:id` - Update complaint (admin only)

### Feedback
- `GET /api/feedback` - Get all feedback (filtered by role)
- `POST /api/feedback` - Create new feedback
- `PUT /api/feedback/:id` - Update feedback (admin only)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/insights` - Get insights and analytics

## Project Structure

```
CFMS/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin components
│   │   │   ├── user/           # User components
│   │   │   └── ui/             # Reusable UI components
│   │   ├── context/            # React context providers
│   │   ├── utils/              # Utility functions
│   │   └── App.tsx             # Main app component
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables (create from env-example.txt)
│   └── .gitignore
└── README.md
```

## Environment Variables

### Backend (.env file)
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET_KEY`: Secret key for JWT token signing

## Security Notes

- **Never commit `.env` file** to version control
- Use strong passwords for MongoDB database user
- Generate a secure random string for JWT_SECRET_KEY
- In production, use environment-specific configurations
- Enable HTTPS in production

## Development

### Running in Development Mode

Backend: `python app.py` (Flask runs with debug mode)
Frontend: `npm run dev` (Vite hot-reload enabled)

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in `frontend/build/`

## Troubleshooting

### Backend won't connect to MongoDB
- Verify your connection string is correct in `.env`
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure your database user has proper permissions

### CORS errors
- Ensure backend CORS is configured for frontend origin
- Check that both servers are running

### Authentication issues
- Verify JWT_SECRET_KEY is set
- Check token expiration settings
- Clear browser localStorage and re-login

## License

This project is for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!

## Support

For issues or questions, please open an issue in the repository.

