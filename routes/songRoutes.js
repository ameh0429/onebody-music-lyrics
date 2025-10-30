import express from 'express';
import upload from '../config/multer.js';
import {
  createSong,
  getAllSongs,
  getSongById,
  updateSong,
  deleteSong
} from '../controllers/songController.js';

const router = express.Router();

// POST /api/songs - Create new song
router.post('/', upload.single('image'), createSong);

// GET /api/songs - Get all songs
router.get('/', getAllSongs);

// GET /api/songs/:id - Get song by ID
router.get('/:id', getSongById);

// PUT /api/songs/:id - Update song
router.put('/:id', upload.single('image'), updateSong);

// DELETE /api/songs/:id - Delete song
router.delete('/:id', deleteSong);

export default router;