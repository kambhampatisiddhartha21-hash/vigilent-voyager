import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import session from "express-session";
import fs from "fs";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, "users.json");

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "vigilent-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 }, // 1 day
  })
);

// ✅ Load users from file or initialize
let users = [];
if (fs.existsSync(USERS_FILE)) {
  try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    users = [];
  }
} else {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ✅ Signup route
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists!" });
  }

  const newUser = { username, email, password };
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  console.log("✅ New user registered:", email);
  res.json({ success: true, message: "Signup successful" });
});

// ✅ Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password!" });
  }

  req.session.user = user;
  console.log("✅ User logged in:", email);
  res.json({ success: true, message: "Login successful" });
});

// ✅ Session check
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// ✅ Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ✅ Serve index.html for all frontend routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
