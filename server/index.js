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

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "VITEM Backend is running!" });
});

const documentRoutes = require("./routes/documentRoutes");

app.use("/api/documents", documentRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
