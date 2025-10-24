import express from 'express';
import { Submission } from '../models/Submission.js';
import { upload } from '../middleWare/multer.js';

const router = express.Router();

router.post('/', upload.array('photos', 3), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    const { registrationNumber } = req.body;
    if (!registrationNumber || !req.files || req.files.length < 3) {
      return res.status(400).json({ message: "Registration number and 3 photos required" });
    }

    const photos = req.files.map((file) => file.filename);

    const submission = new Submission({ registrationNumber, photos });
    await submission.save();

    res.status(201).json({ message: "Submission successful" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
