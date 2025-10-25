import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import cors from 'cors';
//import multer from 'multer';
import { uploadOnCloudinary } from './utils/cloudinary.js';
const app = express();

const allowedOrigins = ["https://amsdatacollection1.netlify.app"];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true, // optional if you send cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import submissionsRoute from './routes/submissions.js';
app.use('/api/submissions', submissionsRoute);

// Default route (optional)
app.get('/', (req, res) => {
  res.send('Server is up and running 🚀');
  console.log("--- DOTENV TEST ---");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("-------------------");
});

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT ||5000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error(err));
export {app};
