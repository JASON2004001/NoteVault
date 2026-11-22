import express from 'express';
import Note from '../models/Note.mondal.js';
import { verifyUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// 1. Get all notes for the logged-in user (optionally filtered by folderId)
router.get('/', verifyUser, async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.folderId) {
      filter.folderId = req.query.folderId === 'root' ? null : req.query.folderId;
    }

    const notes = await Note.find(filter).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
});

// 2. Create a new named note with top text, inline middle image, and bottom text
router.post('/', verifyUser, async (req, res) => {
  try {
    const { title, topContent, imageUrl, bottomContent, folderId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Please give a name to your notepad.' });
    }

    const note = await Note.create({
      userId: req.user.id,
      folderId: folderId || null,
      title: title.trim(),
      topContent: topContent || '',
      imageUrl: imageUrl || '',
      bottomContent: bottomContent || '',
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save note', error: error.message });
  }
});

// 3. Update an existing note (edit title, text, image, or move to a folder)
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const { title, topContent, imageUrl, bottomContent, folderId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Notepad name cannot be empty.' });
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        title: title.trim(),
        topContent: topContent ?? '',
        imageUrl: imageUrl ?? '',
        bottomContent: bottomContent ?? '',
        folderId: folderId !== undefined ? folderId : null,
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
});

// 4. Delete a single note
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    res.json({ message: 'Note deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
});

export default router;