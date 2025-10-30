// import { Album, Artiste, Song } from '../models/index.js';

// // Create a new album
// export const createAlbum = async (req, res, next) => {
//   try {
//     const { name, artisteId, releaseYear, image } = req.body;

//     if (!name || !artisteId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name and artisteId are required'
//       });
//     }

//     // Check if artiste exists
//     const artiste = await Artiste.findByPk(artisteId);
//     if (!artiste) {
//       return res.status(404).json({
//         success: false,
//         message: 'Artiste not found'
//       });
//     }

//     const album = await Album.create({
//       name,
//       artisteId,
//       releaseYear,
//       image
//     });

//     // Fetch the album with artiste info
//     const albumWithArtiste = await Album.findByPk(album.id, {
//       include: [
//         {
//           model: Artiste,
//           as: 'artiste'
//         }
//       ]
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Album created successfully',
//       data: albumWithArtiste
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get all albums
// export const getAllAlbums = async (req, res, next) => {
//   try {
//     const albums = await Album.findAll({
//       include: [
//         {
//           model: Artiste,
//           as: 'artiste',
//           attributes: ['id', 'name', 'image']
//         }
//       ],
//       order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//       success: true,
//       count: albums.length,
//       data: albums
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get album by ID (includes artiste info and all songs)
// export const getAlbumById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const album = await Album.findByPk(id, {
//       include: [
//         {
//           model: Artiste,
//           as: 'artiste'
//         },
//         {
//           model: Song,
//           as: 'songs',
//           order: [['createdAt', 'ASC']]
//         }
//       ]
//     });

//     if (!album) {
//       return res.status(404).json({
//         success: false,
//         message: 'Album not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: album
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Update album
// export const updateAlbum = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { name, artisteId, releaseYear, image } = req.body;

//     const album = await Album.findByPk(id);

//     if (!album) {
//       return res.status(404).json({
//         success: false,
//         message: 'Album not found'
//       });
//     }

//     // If artisteId is being updated, check if the new artiste exists
//     if (artisteId && artisteId !== album.artisteId) {
//       const artiste = await Artiste.findByPk(artisteId);
//       if (!artiste) {
//         return res.status(404).json({
//           success: false,
//           message: 'Artiste not found'
//         });
//       }
//     }

//     await album.update({
//       name: name || album.name,
//       artisteId: artisteId || album.artisteId,
//       releaseYear: releaseYear !== undefined ? releaseYear : album.releaseYear,
//       image: image !== undefined ? image : album.image
//     });

//     // Fetch updated album with artiste info
//     const updatedAlbum = await Album.findByPk(id, {
//       include: [
//         {
//           model: Artiste,
//           as: 'artiste'
//         }
//       ]
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Album updated successfully',
//       data: updatedAlbum
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Delete album
// export const deleteAlbum = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const album = await Album.findByPk(id);

//     if (!album) {
//       return res.status(404).json({
//         success: false,
//         message: 'Album not found'
//       });
//     }

//     await album.destroy();

//     res.status(200).json({
//       success: true,
//       message: 'Album deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

import { Album, Artiste, Song } from '../models/index.js';

// Create a new album
export const createAlbum = async (req, res, next) => {
  try {
    const { name, artisteId, releaseYear } = req.body;

    if (!name || !artisteId) {
      return res.status(400).json({
        success: false,
        message: 'Name and artisteId are required'
      });
    }

    // Check if artiste exists
    const artiste = await Artiste.findByPk(artisteId);
    if (!artiste) {
      return res.status(404).json({
        success: false,
        message: 'Artiste not found'
      });
    }

    // Get image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const album = await Album.create({
      name,
      artisteId,
      releaseYear,
      image
    });

    // Fetch the album with artiste info
    const albumWithArtiste = await Album.findByPk(album.id, {
      include: [
        {
          model: Artiste,
          as: 'artiste'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Album created successfully',
      data: albumWithArtiste
    });
  } catch (error) {
    next(error);
  }
};

// Get all albums
export const getAllAlbums = async (req, res, next) => {
  try {
    const albums = await Album.findAll({
      include: [
        {
          model: Artiste,
          as: 'artiste',
          attributes: ['id', 'name', 'image']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: albums.length,
      data: albums
    });
  } catch (error) {
    next(error);
  }
};

// Get album by ID (includes artiste info and all songs)
export const getAlbumById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const album = await Album.findByPk(id, {
      include: [
        {
          model: Artiste,
          as: 'artiste'
        },
        {
          model: Song,
          as: 'songs',
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    res.status(200).json({
      success: true,
      data: album
    });
  } catch (error) {
    next(error);
  }
};

// Update album
export const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, artisteId, releaseYear } = req.body;

    const album = await Album.findByPk(id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    // If artisteId is being updated, check if the new artiste exists
    if (artisteId && artisteId !== album.artisteId) {
      const artiste = await Artiste.findByPk(artisteId);
      if (!artiste) {
        return res.status(404).json({
          success: false,
          message: 'Artiste not found'
        });
      }
    }

    // Get new image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : album.image;

    await album.update({
      name: name || album.name,
      artisteId: artisteId || album.artisteId,
      releaseYear: releaseYear !== undefined ? releaseYear : album.releaseYear,
      image: image
    });

    // Fetch updated album with artiste info
    const updatedAlbum = await Album.findByPk(id, {
      include: [
        {
          model: Artiste,
          as: 'artiste'
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Album updated successfully',
      data: updatedAlbum
    });
  } catch (error) {
    next(error);
  }
};

// Delete album
export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;

    const album = await Album.findByPk(id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    await album.destroy();

    res.status(200).json({
      success: true,
      message: 'Album deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};