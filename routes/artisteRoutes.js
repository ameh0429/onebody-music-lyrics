// import express from 'express';
// import upload from '../config/multer.js';
// import {
//   createArtiste,
//   getAllArtistes,
//   getArtisteById,
//   updateArtiste,
//   deleteArtiste
// } from '../controllers/artisteController.js';

// const router = express.Router();

// // POST /api/artistes - Create new artiste
// router.post('/', upload.single('image'), createArtiste);

// // GET /api/artistes - Get all artistes
// router.get('/', getAllArtistes);

// // GET /api/artistes/:id - Get artiste by ID
// router.get('/:id', getArtisteById);

// // PUT /api/artistes/:id - Update artiste
// router.put('/:id', upload.single('image'), updateArtiste);

// // DELETE /api/artistes/:id - Delete artiste
// router.delete('/:id', deleteArtiste);

// export default router;

import express from 'express';
import upload from '../config/multer.js';
import { protect } from '../middleware/auth.js';
import {
  createArtiste,
  getAllArtistes,
  getArtisteById,
  updateArtiste,
  deleteArtiste
} from '../controllers/artisteController.js';

const router = express.Router();

// Public routes
router.get('/', getAllArtistes);
router.get('/:id', getArtisteById);

// Protected routes (require authentication)
router.post('/', protect, upload.single('image'), createArtiste);
router.put('/:id', protect, upload.single('image'), updateArtiste);
router.delete('/:id', protect, deleteArtiste);

export default router;