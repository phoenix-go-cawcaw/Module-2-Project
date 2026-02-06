Group 15: Zahraa Thompson and Phoenix Chung

Using Vite/Vue 3 to make the website
+ used the Live Share extension in VSCode for collaboration input

Made use of: 
    Bootstrap Icons
    An ICO image converter for the website logo
    
    Installed JSPDF (enter "install jspdf" into the command prompt/terminal to install its extension) to download unique Payslips in the Payroll view.
    Run "npm install" in the command prompt/terminal to install all Node.js dependancies

    Enter "npm run dev" in the Terminal and ctrl+click the Local host to access the website.

Project Group 20 Setup Guide - Zahraa Thompson, Phoenix Chung, Mihle Dudumashe, Emihle Dumo
Backend Setup (Node.js + Express)
1. Initialize the project
npm init -y

2. Install dependencies
npm install express, mysql2, dotenv, cors for backend's package.json
npm install axios for frontend's package.json, 

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

node --watch index.js
or Download nodemon in ther terminal by using
npm install -g nodemon

This will automatically restart the server whenever files change.

Frontend Setup
1. Install dependencies
npm install

2. Run frontend dev server
npm run dev

Your frontend will start on the local development URL shown in the terminal (commonly http://localhost:5173 for Vite).