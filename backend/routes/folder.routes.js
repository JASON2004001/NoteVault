import express from 'express';
import Folder from '../models/Folder.mondal.js';
import Note from '../models/Note.mondal.js';
import { verifyUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// 1. Get all folders for logged-in user
router.get('/', verifyUser, async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load folders', error: error.message });
  }
});

// 2. Create a new folder
router.post('/', verifyUser, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required.' });
    }

    const folder = await Folder.create({
      userId: req.user.id,
      name: name.trim(),
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create folder', error: error.message });
  }
});

// 3. Delete a folder and all notes inside it
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found.' });
    }

    await Note.deleteMany({ folderId: req.params.id, userId: req.user.id });
    res.json({ message: 'Folder and its notes deleted.', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete folder', error: error.message });
  }
});

export default router;
