import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
//import multer from 'multer';
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://amsdatacollection1.netlify.app/'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import submissionsRoute from './routes/submissions.js';
app.use('/api/submissions', submissionsRoute);

// Default route (optional)
app.get('/', (req, res) => {
  res.send('Server is up and running 🚀');
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