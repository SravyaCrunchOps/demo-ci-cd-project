# MERN App

A minimal MERN stack (MongoDB, Express, React, Node.js) with CI/CD on GitHub Actions.

## Prerequisites
- Node.js 18+
- MongoDB running locally or in the cloud (e.g., Atlas)

## Project Structure

```bash

demo-ci-cd-project
|__ .github
   |__ workflows/
      |__ ci./yml
      |__ cd/yml
|__ ai_agent/
   |__ src/
   |__ package*.json
   |__ Dockerfile
|__ backend/
   |__ src/
      |__ package*.json
      |__ Dockerfile
|__ frontend/
   |__ src/
      |__ package*.json
      |__ Dockerfile
|__ README.md
|__ docker-compose.yml

## Backend
1. Copy `.env.example` to `.env` and set MONGO_URI and PORT.
2. Run:
   ```bash
   cd backend
   npm install
   npm run dev
