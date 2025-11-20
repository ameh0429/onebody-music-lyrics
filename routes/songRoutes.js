// // import express from 'express';
// // import upload from '../config/multer.js';
// // import {
// //   createSong,
// //   getAllSongs,
// //   getSongById,
// //   updateSong,
// //   deleteSong
// // } from '../controllers/songController.js';

// // const router = express.Router();

// // // POST /api/songs - Create new song
// // router.post('/', upload.single('image'), createSong);

// // // GET /api/songs - Get all songs
// // router.get('/', getAllSongs);

// // // GET /api/songs/:id - Get song by ID
// // router.get('/:id', getSongById);

// // // PUT /api/songs/:id - Update song
// // router.put('/:id', upload.single('image'), updateSong);

// // // DELETE /api/songs/:id - Delete song
// // router.delete('/:id', deleteSong);

// // export default router;

// import express from 'express';
// import upload from '../config/multer.js';
// import { protect } from '../middleware/auth.js';
// import {
//   createSong,
//   getAllSongs,
//   getSongById,
//   updateSong,
//   deleteSong
// } from '../controllers/songController.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllSongs);
// router.get('/:id', getSongById);

// // Protected routes (require authentication)
// router.post('/', protect, upload.single('image'), createSong);
// router.put('/:id', protect, upload.single('image'), updateSong);
// router.delete('/:id', protect, deleteSong);

// export default router;


import { Song, Artiste, Album } from '../models/index.js';

// Create a new song
export const createSong = async (req, res, next) => {
  try {
    const { name, artisteId, albumId, lyrics, featuredArtisteIds } = req.body;

    if (!name || !artisteId) {
      return res.status(400).json({
        success: false,
        message: 'Name and artisteId (main artiste) are required'
      });
    }

    // Check if main artiste exists
    const mainArtiste = await Artiste.findByPk(artisteId);
    if (!mainArtiste) {
      return res.status(404).json({
        success: false,
        message: 'Main artiste not found'
      });
    }

    // Parse featuredArtisteIds if provided
    let featuredArtisteIdsArray = [];
    if (featuredArtisteIds) {
      featuredArtisteIdsArray = typeof featuredArtisteIds === 'string' 
        ? JSON.parse(featuredArtisteIds) 
        : featuredArtisteIds;

      // Check if all featured artistes exist
      if (featuredArtisteIdsArray.length > 0) {
        const featuredArtistes = await Artiste.findAll({
          where: { id: featuredArtisteIdsArray }
        });

        if (featuredArtistes.length !== featuredArtisteIdsArray.length) {
          return res.status(404).json({
            success: false,
            message: 'One or more featured artistes not found'
          });
        }
      }
    }

    // Check if album exists (if provided)
    if (albumId) {
      const album = await Album.findByPk(albumId);
      if (!album) {
        return res.status(404).json({
          success: false,
          message: 'Album not found'
        });
      }
    }

    // Get image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const song = await Song.create({
      name,
      artisteId,
      albumId,
      lyrics,
      image
    });

    // Associate featured artistes with song
    if (featuredArtisteIdsArray.length > 0) {
      await song.setFeaturedArtistes(featuredArtisteIdsArray);
    }

    // Fetch the song with main artiste, featured artistes and album info
    const songWithDetails = await Song.findByPk(song.id, {
      include: [
        {
          model: Artiste,
          as: 'mainArtiste',
          attributes: ['id', 'name', 'image']
        },
        {
          model: Artiste,
          as: 'featuredArtistes',
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] }
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'name', 'image']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Song created successfully',
      data: songWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// Get all songs
export const getAllSongs = async (req, res, next) => {
  try {
    const songs = await Song.findAll({
      include: [
        {
          model: Artiste,
          as: 'mainArtiste',
          attributes: ['id', 'name', 'image']
        },
        {
          model: Artiste,
          as: 'featuredArtistes',
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] }
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'name', 'image']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: songs.length,
      data: songs
    });
  } catch (error) {
    next(error);
  }
};

// Get song by ID
export const getSongById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const song = await Song.findByPk(id, {
      include: [
        {
          model: Artiste,
          as: 'mainArtiste',
          attributes: ['id', 'name', 'image', 'desc']
        },
        {
          model: Artiste,
          as: 'featuredArtistes',
          attributes: ['id', 'name', 'image', 'desc'],
          through: { attributes: [] }
        },
        {
          model: Album,
          as: 'album',
          include: [
            {
              model: Artiste,
              as: 'artistes',
              attributes: ['id', 'name', 'image'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.status(200).json({
      success: true,
      data: song
    });
  } catch (error) {
    next(error);
  }
};

// Update song
export const updateSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, artisteId, albumId, lyrics, featuredArtisteIds } = req.body;

    const song = await Song.findByPk(id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // If artisteId is being updated, check if the new artiste exists
    if (artisteId && artisteId !== song.artisteId) {
      const artiste = await Artiste.findByPk(artisteId);
      if (!artiste) {
        return res.status(404).json({
          success: false,
          message: 'Main artiste not found'
        });
      }
    }

    // Parse and update featuredArtisteIds if provided
    if (featuredArtisteIds !== undefined) {
      const featuredArtisteIdsArray = typeof featuredArtisteIds === 'string' 
        ? JSON.parse(featuredArtisteIds) 
        : featuredArtisteIds;

      if (featuredArtisteIdsArray.length > 0) {
        // Check if all featured artistes exist
        const featuredArtistes = await Artiste.findAll({
          where: { id: featuredArtisteIdsArray }
        });

        if (featuredArtistes.length !== featuredArtisteIdsArray.length) {
          return res.status(404).json({
            success: false,
            message: 'One or more featured artistes not found'
          });
        }

        // Update featured artistes association
        await song.setFeaturedArtistes(featuredArtisteIdsArray);
      } else {
        // Clear featured artistes if empty array provided
        await song.setFeaturedArtistes([]);
      }
    }

    // If albumId is being updated, check if the new album exists
    if (albumId !== undefined && albumId !== song.albumId) {
      if (albumId !== null) {
        const album = await Album.findByPk(albumId);
        if (!album) {
          return res.status(404).json({
            success: false,
            message: 'Album not found'
          });
        }
      }
    }

    // Get new image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : song.image;

    await song.update({
      name: name || song.name,
      artisteId: artisteId || song.artisteId,
      albumId: albumId !== undefined ? albumId : song.albumId,
      lyrics: lyrics !== undefined ? lyrics : song.lyrics,
      image: image
    });

    // Fetch updated song with artiste and album info
    const updatedSong = await Song.findByPk(id, {
      include: [
        {
          model: Artiste,
          as: 'mainArtiste',
          attributes: ['id', 'name', 'image']
        },
        {
          model: Artiste,
          as: 'featuredArtistes',
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] }
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'name', 'image']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Song updated successfully',
      data: updatedSong
    });
  } catch (error) {
    next(error);
  }
};

// Delete song
export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;

    const song = await Song.findByPk(id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    await song.destroy();

    res.status(200).json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};