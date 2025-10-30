import express from 'express';
import upload from '../config/multer.js';
import {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum
} from '../controllers/albumController.js';

const router = express.Router();

// POST /api/albums - Create new album
router.post('/', upload.single('image'), createAlbum);

// GET /api/albums - Get all albums
router.get('/', getAllAlbums);

// GET /api/albums/:id - Get album by ID (includes artiste info and all songs)
router.get('/:id', getAlbumById);

// PUT /api/albums/:id - Update album
router.put('/:id', upload.single('image'), updateAlbum);

// DELETE /api/albums/:id - Delete album
router.delete('/:id', deleteAlbum);

export default router;