import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import folderRoutes from './routes/folder.routes.js';
import noteRoutes from './routes/note.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas (NoteVault)'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });


app.get('/', (req, res) => {
  res.send('NoteVault API is live and running.');
});


app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/notes', noteRoutes);

app.listen(PORT, () => {
  console.log(`NoteVault Backend running on http://localhost:${PORT}`);
});