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
|__ backend/
|__ frotned/

## Backend
1. Copy `.env.example` to `.env` and set MONGO_URI and PORT.
2. Run:
   ```bash
   cd backend
   npm install
   npm run dev
