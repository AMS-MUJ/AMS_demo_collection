const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true },
  photos: [{ type: String, required: true }], // base64 images
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
