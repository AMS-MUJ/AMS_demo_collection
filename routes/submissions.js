import express from "express";
import path from "path";
import fs from "fs";
import { Submission } from "../models/Submission.js";
import multer from "multer";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const regNo = req.body.registrationNumber;
    if (!regNo) {
      return cb(new Error("Registration number is required"), null);
    }

    const uploadPath = path.join("public", "temp", regNo);

    // Ensure folder exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.array("photos", 3), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files);

    const { registrationNumber } = req.body;
    if (!registrationNumber || !req.files || req.files.length < 3) {
      return res
        .status(400)
        .json({ message: "Registration number and 3 photos required" });
    }

    // Store relative paths (so frontend can access if needed)
    const photos = req.files.map((file) =>
      path.join("temp", registrationNumber, file.filename)
    );

    const submission = new Submission({ registrationNumber, photos });
    await submission.save();

    res.status(201).json({
      message: "✅ Submission successful",
      folder: `/public/temp/${registrationNumber}`,
      photos,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
