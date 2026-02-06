Project Group 20 Setup Guide - Zahraa Thompson, Phoenix Chung, Mihle Dudumashe, Emihle Dumo
Backend Setup (Node.js + Express)
1. Initialize the project in terminal (cmd, bash)
'npm init -y'

2. Install dependencies
'npm install express, mysql2, dotenv, cors' for backend's package.json
'npm install axios' for frontend's package.json, 

3. Enable ES Modules

Open backend package.json and add:

"type": "module"

4. Create the entry file

Create index.js in the root of your backend folder.

5. Basic backend server setup
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api`);
});

6. Run backend with auto-restart

Use Node’s built-in watcher:

'cd .. ' in terminal if currently located in Frontend
'cd backend'
'node --watch "index.js"'
or Download nodemon in ther terminal by using
'npm install -g nodemon'

This will automatically restart the server whenever files change.

Frontend Setup
1. Install dependencies
'cd ..' in terminal if currently located in Backend
'cd frontend'
'npm install' or 'npm i'

2. Run frontend dev server
'npm run dev'

Your frontend will start on the local development URL shown in the terminal (commonly http://localhost:5173 for Vite).

Please Use hard coded login for Frontend Application.
email: hr@moderntech.com
password: hr123