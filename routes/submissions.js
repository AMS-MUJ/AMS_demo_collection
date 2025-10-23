import express from 'express';
import { Submission } from '../models/Submission.js';
import { Router } from 'express';
import fs from 'fs';
import { upload } from '../middleWare/multer.js';
const router= Router();

router.post('/',upload.any(), async (req, res) => {
  try {
    console.log('Request body:', req.body);
     console.log('Uploaded files:', req.files);
    const { registrationNumber } = req.body;
    const photos=req.files.map(file=>file.filename);
     if (!registrationNumber || !photos ) {
      return res.status(400).json({ message: "Registration number and 3 photos required" });
    }

    const submission = new Submission({ registrationNumber, photos });
    await submission.save();
  
    res.status(201).json({ message: "Submission successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
