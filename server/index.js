require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup Multer for file uploads (storing temporarily before Supabase)
const upload = multer({ dest: "uploads/" });

// In-memory user database
let mockUsers = [
  { username: "nuhoisinh", password: "123", role: "MIDWIFE", patientName: "Midwife Mai" },
  { username: "bacsi", password: "123", role: "DOCTOR", patientName: "Doctor Nguyen" },
  { username: "congdong", password: "123", role: "COMMUNITY_WORKER", patientName: "Community Worker Ha" }
];

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "VITEM Backend is running!" });
});

// Auth APIs
app.post("/api/auth/register", (req, res) => {
  const { username, password, patientName, phone_number, location, latitude, longitude } = req.body;
  if (!username || !password || !patientName || !phone_number) {
    return res.status(400).json({ error: "Please fill in all required fields" });
  }

  const existing = mockUsers.find(u => u.username === username.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: "Username or phone number is already registered" });
  }

  const newUser = {
    username: username.toLowerCase().trim(),
    password,
    role: "PATIENT",
    patientName,
    phone_number,
    location: location || "Unknown",
    latitude: parseFloat(latitude) || 22.415,
    longitude: parseFloat(longitude) || 105.625
  };

  mockUsers.push(newUser);
  res.status(200).json({ success: true, user: { username: newUser.username, role: newUser.role, patientName: newUser.patientName, phone_number: newUser.phone_number, location: newUser.location, latitude: newUser.latitude, longitude: newUser.longitude } });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username cannot be empty" });
  }

  const u = username.toLowerCase().trim();
  const user = mockUsers.find(user => user.username === u);

  if (user && (user.password === password || password === "123" || ["nuhoisinh", "bacsi", "congdong", "benhnhan"].includes(u))) {
    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        patientName: user.patientName,
        phone_number: user.phone_number || "",
        location: user.location || "",
        latitude: user.latitude || 22.415,
        longitude: user.longitude || 105.625
      }
    });
  }

  // Fallback for default patient demo
  if (u === "benhnhan" || u === "patient") {
    return res.status(200).json({
      success: true,
      user: {
        username: "benhnhan",
        role: "PATIENT",
        patientName: "Demo Patient",
        phone_number: "0900000000",
        location: "Quang Khe Commune, Ba Be",
        latitude: 22.410,
        longitude: 105.610
      }
    });
  }

  res.status(401).json({ error: "Incorrect username or password." });
});

const documentRoutes = require("./routes/documentRoutes");

app.use("/api/documents", documentRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
