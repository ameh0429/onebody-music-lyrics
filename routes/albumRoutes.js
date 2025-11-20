// import express from 'express';
// import upload from '../config/multer.js';
// import {
//   createAlbum,
//   getAllAlbums,
//   getAlbumById,
//   updateAlbum,
//   deleteAlbum
// } from '../controllers/albumController.js';

// const router = express.Router();

// // POST /api/albums - Create new album
// router.post('/', upload.single('image'), createAlbum);

// // GET /api/albums - Get all albums
// router.get('/', getAllAlbums);

// // GET /api/albums/:id - Get album by ID (includes artiste info and all songs)
// router.get('/:id', getAlbumById);

// // PUT /api/albums/:id - Update album
// router.put('/:id', upload.single('image'), updateAlbum);

// // DELETE /api/albums/:id - Delete album
// router.delete('/:id', deleteAlbum);

// export default router;

import express from 'express';
import upload from '../config/multer.js';
import { protect } from '../middleware/auth.js';
import {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum
} from '../controllers/albumController.js';

const router = express.Router();

// Public routes
router.get('/', getAllAlbums);
router.get('/:id', getAlbumById);

// Protected routes (require authentication)
router.post('/', protect, upload.single('image'), createAlbum);
router.put('/:id', protect, upload.single('image'), updateAlbum);
router.delete('/:id', protect, deleteAlbum);

export default router;