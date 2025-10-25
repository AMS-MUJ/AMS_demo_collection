import express from "express";
import path from "path";
import fs from "fs";
import { Submission } from "../models/Submission.js";
import multer from "multer";

// <-- NEW: Import your Cloudinary upload function
// (Adjust the path '..' as needed based on your file structure)
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 

const router = express.Router();

// Configure multer storage (This part is perfect, no changes needed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const regNo = req.body.registrationNumber;
    if (!regNo) {
      return cb(new Error("Registration number is required"), null);
    }
    
    // This path is where files are *temporarily* stored
    const uploadPath = path.join("public", "temp", regNo);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// --- MODIFIED ROUTE HANDLER ---
router.post("/", upload.array("photos", 3), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files); // These are the temporary local files

    const { registrationNumber } = req.body;
    if (!registrationNumber || !req.files || req.files.length < 3) {
      return res
        .status(400)
        .json({ message: "Registration number and 3 photos required" });
    }

    // <-- NEW: Step 1 - Create an array of upload promises
    const uploadPromises = req.files.map(file => 
      uploadOnCloudinary(file.path) // 'file.path' is the localFilePath
    );

    // <-- NEW: Step 2 - Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);

    // <-- NEW: Step 3 - Check for any failed uploads
    if (uploadResults.some(result => result === null)) {
      // Your uploadOnCloudinary function returns null on failure
      return res.status(500).json({ message: "Failed to upload one or more images to Cloudinary" });
    }

    // <-- NEW: Step 4 - Get the secure URLs from the results
    const photoUrls = uploadResults.map(result => result.secure_url);

    // <-- MODIFIED: Step 5 - Save the Cloudinary URLs to the database
    const submission = new Submission({ 
      registrationNumber, 
      photos: photoUrls // Save the array of URLs
    });
    await submission.save();

    // <-- MODIFIED: Step 6 - Send the Cloudinary URLs in the response
    res.status(201).json({
      message: "✅ Submission successful",
      photos: photoUrls,
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;