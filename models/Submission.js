import mongoose from 'mongoose';
const submissionSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true ,unique:true},
  photos: [{ type: String, required: true }], // base64 images
  Section:{ type: String, required: true ,unique:true},
  Year:{ type: String, required: true ,unique:true},
  //submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Submission = mongoose.model('Submission', submissionSchema);
