import express from "express";
import path from "path";
import fs from "fs"; // <-- Make sure 'fs' is imported with promise support
import { Submission } from "../models/Submission.js";
import multer from "multer";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const regNo = req.body.registrationNumber;
    if (!regNo) {
      // Multer won't have req.body *before* parsing, 
      // but this check is good. Let's rely on the handler's check.
      // We'll create a generic temp path first.
      const tempPath = path.join("public", "temp");
      fs.mkdirSync(tempPath, { recursive: true });
      cb(null, tempPath);
    } else {
      // If regNo is available (e.g., not a file field)
      const uploadPath = path.join("public", "temp", regNo);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// --- MODIFIED ROUTE HANDLER ---
router.post("/", upload.any("photos", 3), async (req, res) => {
  // Get the path to the user's temp directory for cleanup
  const userTempDir = req.files.length > 0 ? path.dirname(req.files[0].path) : null;

  try {
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files); 

    const { registrationNumber, Section, Year, name } = req.body;
    if (!registrationNumber) {
      return res
        .status(400)
        .json({ message: "Registration number is required" });
    }

    // --- ⬇️ HERE IS YOUR CHECK ⬇️ ---
    // Step 1: Check if the user already exists
    const existingSubmission = await Submission.findOne({ registrationNumber });

    // Step 2: If they exist, reject the request
    if (existingSubmission) {
      console.log(`Rejected: Registration number ${registrationNumber} already exists.`);
      // 409 Conflict is the correct HTTP status code for this
      return res.status(409).json({
        message: "This registration number has already submitted.",
      });
    }
    // --- ⬆️ END OF CHECK ⬆️ ---

    // Step 3: If not, proceed. Check for required files.
    if (!req.files || req.files.length < 3) {
      return res
        .status(400)
        .json({ message: "At least 3 photos are required" });
    }

    // Step 4: Upload to Cloudinary
    const uploadPromises = req.files.map(file =>
      uploadOnCloudinary(file.path, registrationNumber) 
    );
    const uploadResults = await Promise.all(uploadPromises);

    // Step 5: Check for Cloudinary failures
    if (uploadResults.some(result => result === null)) {
      return res.status(500).json({ message: "Failed to upload one or more images to Cloudinary" });
    }

    // Step 6: Get URLs and save new submission to DB
    const photoUrls = uploadResults.map(result => result.secure_url);
    const submission = new Submission({
      registrationNumber,
      photos: photoUrls,
      Section,
      Year,
      name,
    });
    await submission.save();

    // Step 7: Send success response
    res.status(201).json({
      message: "✅ Submission successful",
      photos: photoUrls,
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    // --- ⬇️ CRITICAL CLEANUP STEP ⬇️ ---
    // This block runs *no matter what* (success, failure, or rejection)
    // It deletes the temporary files from your server.
    if (req.files && req.files.length > 0) {
      console.log("Cleaning up temporary files...");
      try {
        // Create an array of promises for file deletions
        const unlinkPromises = req.files.map(file => fs.promises.unlink(file.path));
        
        // Wait for all files to be deleted
        await Promise.allSettled(unlinkPromises);
        console.log("Temporary files deleted successfully.");

        // After deleting files, try to remove the user's temp directory
        if (userTempDir && fs.existsSync(userTempDir)) {
          await fs.promises.rmdir(userTempDir);
          console.log(`Temporary directory ${userTempDir} deleted.`);
        }
      } catch (cleanupError) {
        console.error("Error during temporary file cleanup:", cleanupError);
      }
    }
  }
});


// --- ⬇️ FIXED GET ROUTE ⬇️ ---
// I moved this *outside* the POST handler and fixed the path.
// This route is for a frontend to check if a user *can* submit.
router.get("/check/:registrationNumber", async (req, res) => {
      try {
        const { registrationNumber } = req.params;
        const existing = await Submission.findOne({ registrationNumber });
        res.json({ exists: !!existing }); // Returns { "exists": true } or { "exists": false }
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
});


export default router;