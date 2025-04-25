# 3D Model Viewer

A web application that allows users to upload, store, and view 3D models in a browser. Built with React, Three.js, and Node.js.

## Features

- Upload 3D models (GLB format)
- View 3D models with interactive controls
- Store models in AWS S3
- MongoDB database for model metadata
- Responsive Material-UI interface

## Tech Stack

### Frontend
- React
- Three.js (@react-three/fiber, @react-three/drei)
- Material-UI
- Axios

### Backend
- Node.js
- Express
- MongoDB
- AWS S3
- Multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS S3 bucket
- AWS credentials

## Setup

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables

Create `.env` files in both frontend and backend directories:

Frontend `.env`:
```
REACT_APP_API_URL
```

Backend `.env`:
```
PORT=5000
MONGODB_URI
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_BUCKET_NAME
```

4. Start the development servers

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. Navigate to the dashboard
2. Click "Upload New 3D Model"
3. Fill in the model name and description
4. Select a GLB file to upload
5. Click "Upload Model"
6. View your uploaded models in the dashboard
7. Click "View Model" to interact with the 3D model

