// server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import session from "express-session";

// Fix __dirname since we're using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(
  session({
    secret: "vigilent_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// In-memory user database
const users = {};

// --- ROUTES ---

// Signup
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  if (users[email]) {
    return res.json({ success: false, message: "Email already registered" });
  }

  users[email] = { username, password };
  console.log("✅ New user created:", users[email]);

  res.json({ success: true, message: "Account created successfully!" });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users[email];

  if (user && user.password === password) {
    req.session.user = { email, username: user.username };
    console.log("✅ User logged in:", user.username);
    return res.json({ success: true, message: "Login successful" });
  }

  res.json({ success: false, message: "Invalid email or password" });
});

// Session check
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Handle location data (optional from frontend)
app.post("/location", (req, res) => {
  console.log("📍 User location data:", req.body);
  res.sendStatus(200);
});

// Fallback to frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
