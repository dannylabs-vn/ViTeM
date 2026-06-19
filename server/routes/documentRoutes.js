const express = require("express");
const multer = require("multer");
const { uploadDocument, getCases, updateCase, approveCase, escalateCase } = require("../controllers/documentController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /api/documents/upload
router.post("/upload", upload.single("document"), uploadDocument);

// GET /api/documents
router.get("/", getCases);

// PUT /api/documents/:id
router.put("/:id", updateCase);

// POST /api/documents/:id/approve
router.post("/:id/approve", approveCase);

// POST /api/documents/:id/escalate
router.post("/:id/escalate", escalateCase);

module.exports = router;
