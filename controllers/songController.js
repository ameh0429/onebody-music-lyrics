// import { Song, Artiste, Album } from '../models/index.js';

// // Create a new song
// export const createSong = async (req, res, next) => {
//   try {
//     const { name, artisteId, albumId, lyrics } = req.body;

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

//     // Check if album exists (if provided)
//     if (albumId) {
//       const album = await Album.findByPk(albumId);
//       if (!album) {
//         return res.status(404).json({
//           success: false,
//           message: 'Album not found'
//         });
//       }
//     }

//      // Get image path if uploaded
//     const image = req.file ? `/uploads/${req.file.filename}` : null;

//     const song = await Song.create({
//       name,
//       artisteId,
//       albumId,
//       lyrics,
//       image
//     });

//     // Fetch the song with artiste and album info
//     const songWithDetails = await Song.findByPk(song.id, {
//       include: [
//         {
//           model: Artiste,
//           as: 'artiste',
//           attributes: ['id', 'name', 'image']
//         },
//         {
//           model: Album,
//           as: 'album',
//           attributes: ['id', 'name', 'image']
//         }
//       ]
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Song created successfully',
//       data: songWithDetails
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get all songs
// export const getAllSongs = async (req, res, next) => {
//   try {
//     const songs = await Song.findAll({
//       include: [
//         {
//           model: Artiste,
//           as: 'artiste',
//           attributes: ['id', 'name', 'image']
//         },
//         {
//           model: Album,
//           as: 'album',
//           attributes: ['id', 'name', 'image']
//         }
//       ],
//       order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//       success: true,
//       count: songs.length,
//       data: songs
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get song by ID
// export const getSongById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const song = await Song.findByPk(id, {
//       include: [
//         {
//           model: Artiste,
//           as: 'artiste'
//         },
//         {
//           model: Album,
//           as: 'album'
//         }
//       ]
//     });

//     if (!song) {
//       return res.status(404).json({
//         success: false,
//         message: 'Song not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: song
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Update song
// export const updateSong = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { name, artisteId, albumId, lyrics } = req.body;

//     const song = await Song.findByPk(id);

//     if (!song) {
//       return res.status(404).json({
//         success: false,
//         message: 'Song not found'
//       });
//     }

//     // If artisteId is being updated, check if the new artiste exists
//     if (artisteId && artisteId !== song.artisteId) {
//       const artiste = await Artiste.findByPk(artisteId);
//       if (!artiste) {
//         return res.status(404).json({
//           success: false,
//           message: 'Artiste not found'
//         });
//       }
//     }

//     // If albumId is being updated, check if the new album exists
//     if (albumId !== undefined && albumId !== song.albumId) {
//       if (albumId !== null) {
//         const album = await Album.findByPk(albumId);
//         if (!album) {
//           return res.status(404).json({
//             success: false,
//             message: 'Album not found'
//           });
//         }
//       }
//     }

//       // Get new image path if uploaded
//     const image = req.file ? `/uploads/${req.file.filename}` : song.image;

//     await song.update({
//       name: name || song.name,
//       artisteId: artisteId || song.artisteId,
//       albumId: albumId !== undefined ? albumId : song.albumId,
//       lyrics: lyrics !== undefined ? lyrics : song.lyrics,
//       image: image
//     });

//     // Fetch updated song with artiste and album info
//     const updatedSong = await Song.findByPk(id, {
//       include: [
//         {
//           model: Artiste,
//           as: 'artiste'
//         },
//         {
//           model: Album,
//           as: 'album'
//         }
//       ]
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Song updated successfully',
//       data: updatedSong
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Delete song
// export const deleteSong = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const song = await Song.findByPk(id);

//     if (!song) {
//       return res.status(404).json({
//         success: false,
//         message: 'Song not found'
//       });
//     }

//     await song.destroy();

//     res.status(200).json({
//       success: true,
//       message: 'Song deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

import { Song, Artiste, Album } from '../models/index.js';
import { Op } from 'sequelize';

// Create a new song
export const createSong = async (req, res, next) => {
  try {
    const { name, albumId, lyrics, artistes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Parse artistes if it's a string (from form-data)
    let artistesArray = [];
    if (artistes) {
      artistesArray = typeof artistes === 'string' 
        ? JSON.parse(artistes) 
        : artistes;
    }

    if (!artistesArray || artistesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one artiste is required'
      });
    }

    // Validate artistes exist
    const artisteIds = artistesArray.map(a => a.id);
    const foundArtistes = await Artiste.findAll({
      where: { id: artisteIds }
    });

    if (foundArtistes.length !== artisteIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more artistes not found'
      });
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
      albumId,
      lyrics,
      image
    });

    // // Associate artistes with song
    // await song.setArtistes(artisteIdsArray);

     // Associate artistes with featured flag
    for (const a of artistesArray) {
      await song.addArtiste(a.id, { through: { isFeatured: a.isFeatured || false } });
    }


    // Fetch the song with artiste and album info
    const songWithDetails = await Song.findByPk(song.id, {
      include: [
        {
          model: Artiste,
          as: 'artistes',
          attributes: ['id', 'name', 'image'],
          through: { attributes: ['isFeatured'] }
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // Search condition only on song name
    const whereCondition = search
      ? { name: { [Op.iLike]: `%${search}%` } } // use Op.like if MySQL
      : {};

    // Query with pagination + search
    const { rows: songs, count } = await Song.findAndCountAll({
      attributes: ['id', 'name'],
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
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
          as: 'artistes',
          attributes: ['id', 'name', 'image', 'desc'],
          through: { attributes: ['isFeatured'] }
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'name']
          // include: [
          //   {
          //     model: Artiste,
          //     as: 'artistes',
          //     attributes: ['id', 'name', 'image'],
          //     through: { attributes: [] }
          //   }
          // ]
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
// export const updateSong = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { name, albumId, lyrics, artistes } = req.body;

//     const song = await Song.findByPk(id);

//     if (!song) {
//       return res.status(404).json({
//         success: false,
//         message: 'Song not found'
//       });
//     }

//     // Parse and update artisteIds if provided
//     if (artistes) {
//       const artisteIdsArray = typeof artisteIds === 'string' 
//         ? JSON.parse(artistes) 
//         : artistes;

//       if (artisteIdsArray.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'At least one artiste is required'
//         });
//       }

//       // Check if all artistes exist
//       const artistes = await Artiste.findAll({
//         where: {
//           id: artisteIdsArray
//         }
//       });

//       if (artistes.length !== artisteIdsArray.length) {
//         return res.status(404).json({
//           success: false,
//           message: 'One or more artistes not found'
//         });
//       }

//       // Update artistes association
//       await song.setArtistes(artisteIdsArray);
//     }

//     // If albumId is being updated, check if the new album exists
//     if (albumId !== undefined && albumId !== song.albumId) {
//       if (albumId !== null) {
//         const album = await Album.findByPk(albumId);
//         if (!album) {
//           return res.status(404).json({
//             success: false,
//             message: 'Album not found'
//           });
//         }
//       }
//     }

//     // Get new image path if uploaded
//     const image = req.file ? `/uploads/${req.file.filename}` : song.image;

//     await song.update({
//       name: name || song.name,
//       albumId: albumId !== undefined ? albumId : song.albumId,
//       lyrics: lyrics !== undefined ? lyrics : song.lyrics,
//       image: image
//     });

//     // Fetch updated song with artiste and album info
//     const updatedSong = await Song.findByPk(id, {
//       include: [
//         {
//           model: Artiste,
//           as: 'artistes',
//           attributes: ['id', 'name', 'image'],
//           through: { attributes: [] }
//         },
//         {
//           model: Album,
//           as: 'album',
//           attributes: ['id', 'name', 'image']
//         }
//       ]
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Song updated successfully',
//       data: updatedSong
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const updateSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, albumId, lyrics, artistes } = req.body;

    const song = await Song.findByPk(id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Parse and update artistes if provided
    if (artistes) {
      const artistesArray = typeof artistes === 'string'
        ? JSON.parse(artistes)
        : artistes;

      if (artistesArray.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one artiste is required'
        });
      }

      // Validate artistes exist
      const artisteIds = artistesArray.map(a => a.id);
      const foundArtistes = await Artiste.findAll({
        where: { id: artisteIds }
      });

      if (foundArtistes.length !== artisteIds.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more artistes not found'
        });
      }

      // Clear old associations and re-add with featured flag
      await song.setArtistes([]); 
      for (const a of artistesArray) {
        await song.addArtiste(a.id, { through: { isFeatured: a.isFeatured || false } });
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
      albumId: albumId !== undefined ? albumId : song.albumId,
      lyrics: lyrics !== undefined ? lyrics : song.lyrics,
      image: image
    });

    // Fetch updated song with artiste and album info
    const updatedSong = await Song.findByPk(id, {
      include: [
        {
          model: Artiste,
          as: 'artistes',
          attributes: ['id', 'name', 'image'],
          through: { attributes: ['isFeatured'] } // 👈 include featured info
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