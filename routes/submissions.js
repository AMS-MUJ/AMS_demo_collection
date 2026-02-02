import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import ExcelJS from "exceljs"; // <-- 📦 For Excel export
import { Submission } from "../models/Submission.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();

// ============================
// 📁 MULTER CONFIG
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const regNo = req.body.registrationNumber;
    if (!regNo) {
      const tempPath = path.join("public", "temp");
      fs.mkdirSync(tempPath, { recursive: true });
      cb(null, tempPath);
    } else {
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

// ============================
// 📨 POST: SUBMISSION
// ============================
router.post("/", upload.array("photos", 3), async (req, res) => {
  // Determine temp directory for cleanup
  const userTempDir = (req.files && req.files.length > 0) ? path.dirname(req.files[0].path) : null;

  try {
    const { registrationNumber, section, academicYear, name, branch } = req.body;

    if (!registrationNumber) {
      return res.status(400).json({ message: "Registration number is required" });
    }

    // Check duplicate
    const existingSubmission = await Submission.findOne({ registrationNumber });
    if (existingSubmission) {
      return res.status(409).json({ message: "This registration number has already submitted." });
    }

    // ✅ CHANGE: Validation logic
    // Previously: if (req.files.length < 3) ...
    // Now: Just check if at least ONE file exists. 
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one photo." });
    }

    // Upload to Cloudinary (Works for 1, 2, or 3 files dynamically)
    const uploadPromises = req.files.map(file =>
      uploadOnCloudinary(file.path, registrationNumber)
    );
    const uploadResults = await Promise.all(uploadPromises);

    if (uploadResults.some(result => result === null)) {
      return res.status(500).json({ message: "Failed to upload one or more images to Cloudinary" });
    }

    const photoUrls = uploadResults.map(result => result.secure_url);

    const submission = new Submission({
      registrationNumber,
      photos: photoUrls,
      section,
      academicYear,
      name,
      branch, 
    });

    await submission.save();

    res.status(201).json({
      message: "✅ Submission successful",
      data: {
        registrationNumber,
        uploadedCount: photoUrls.length, // Returns how many were uploaded
        photos: photoUrls
      }
    });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    // Cleanup Logic
    if (req.files && req.files.length > 0) {
      try {
        const unlinkPromises = req.files.map(file => fs.promises.unlink(file.path));
        await Promise.allSettled(unlinkPromises);
        if (userTempDir && fs.existsSync(userTempDir) && userTempDir.includes("temp")) {
             await fs.promises.rmdir(userTempDir).catch(() => {}); 
        }
      } catch (cleanupError) {
        console.error("⚠️ Cleanup Error:", cleanupError);
      }
    }
  }
});

// ... (Keep your GET/Check/Export routes as they were) ...

// ============================
// 📤 GET: EXPORT ALL SUBMISSIONS TO EXCEL
// ============================
router.get("/export", async (req, res) => {
  try {
    const submissions = await Submission.find({}, "registrationNumber name section academicYear").lean();

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: "No submissions found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Submissions");

    // Define columns
    worksheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Registration Number", key: "registrationNumber", width: 25 },
      { header: "Name", key: "name", width: 25 },
      { header: "Section", key: "Section", width: 15 },
    ];

    // Add rows
    submissions.forEach((sub, index) => {
      worksheet.addRow({
        sno: index + 1,
        registrationNumber: sub.registrationNumber,
        name: sub.name,
        Section: sub.Section || "N/A",
        Year: sub.Year || "N/A",
      });
    });

    // Format header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    // Set headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=submissions.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ message: "Error generating Excel file", error: error.message });
  }
});

export default router;
