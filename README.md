# AI Image Creator

A full-stack MERN application for generating AI images, uploading them to Cloudinary, storing post metadata in MongoDB, and sharing results in a community gallery.

## Features
- Generate images from text prompts using the OpenAI Images API
- Upload generated images to Cloudinary
- Save and retrieve posts from MongoDB
- Search posts by name or prompt
- Responsive community gallery UI with Tailwind and Framer Motion
- Security and validation middleware on the backend

## Tech Stack
- Frontend: React, Vite, React Router, Tailwind CSS, Framer Motion, React Hot Toast
- Backend: Node.js, Express, MongoDB, Mongoose, OpenAI, Cloudinary

## Project Structure
- frontend/ for the React application
- backend/ for the Express API

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance
- OpenAI API key
- Cloudinary account

### Backend setup
1. cd backend
2. npm install
3. Copy .env.example to .env and fill in the required values
4. npm start

### Frontend setup
1. cd frontend
2. npm install
3. Create a .env file with VITE_API_URL=http://localhost:5000/api/v1
4. npm run dev

## Environment Variables
See backend/.env.example for the required backend variables.

## API Endpoints
- POST /api/v1/images/generate
- POST /api/v1/posts
- GET /api/v1/posts
- GET /api/v1/posts/search?q=term
- GET /health

## Deployment Notes
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Storage: Cloudinary
