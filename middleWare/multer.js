import multer from "multer";
import fs from "fs";
import path from "path";

// Define storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const regNo = req.body.registrationNumber; // Get reg no from form data
    if (!regNo) {
      return cb(new Error("Registration number is required"), null);
    }

    // Create folder path
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

export default upload;
