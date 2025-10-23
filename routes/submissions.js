const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

router.post('/', async (req, res) => {
  try {
    const { registrationNumber, photos } = req.body;
    if (!registrationNumber || !photos || photos.length !== 3) {
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

module.exports = router;
