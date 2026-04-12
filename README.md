# Gurukrupa Krushi Kendra

## Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

## Quick Start (Recommended)
Open a terminal in the root directory and run:
```bash
npm start
```
This will start both the backend and frontend simultaneously.

## Manual Setup & Running
### 1. Backend
Open a terminal and run:
```bash
cd backend
npm install
npm start
```
The backend server will run on `http://localhost:5000`.

### 2. Frontend
Open another terminal and run:
```bash
npx serve frontend
```
Then open `http://localhost:3000` (or the port provided by `serve`) in your browser.

*Alternatively, you can just open `frontend/index.html` directly in your browser, but using a server like `serve` is recommended for better compatibility.*

## Database Seeding (Optional)
If you need to populate the database with initial data:
```bash
cd backend
node seedProducts.js
node seedAdmin.js
```
