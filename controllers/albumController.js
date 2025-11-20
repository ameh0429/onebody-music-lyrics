import { Album, Artiste, Song } from '../models/index.js';

// Create a new album
export const createAlbum = async (req, res, next) => {
  try {
    const { name, releaseYear, artisteIds } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Parse artisteIds if it's a string (from form-data)
    let artisteIdsArray = [];
    if (artisteIds) {
      artisteIdsArray = typeof artisteIds === 'string' 
        ? JSON.parse(artisteIds) 
        : artisteIds;
    }

    if (!artisteIdsArray || artisteIdsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one artiste is required'
      });
    }

    // Check if all artistes exist
    const artistes = await Artiste.findAll({
      where: {
        id: artisteIdsArray
      }
    });

    if (artistes.length !== artisteIdsArray.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more artistes not found'
      });
    }

    // Get image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const album = await Album.create({
      name,
      releaseYear,
      image
    });

    // Associate artistes with album
    await album.setArtistes(artisteIdsArray);

    // Fetch the album with artistes info
    const albumWithArtistes = await Album.findByPk(album.id, {
      include: [
        {
          model: Artiste,
          as: 'artistes',
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Album created successfully',
      data: albumWithArtistes
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
          as: 'artistes',
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] }
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

// Get album by ID (includes artistes info and all songs with their artistes)
export const getAlbumById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const album = await Album.findByPk(id, {
      include: [
        {
          model: Artiste,
          as: 'artistes',
          attributes: ['id', 'name', 'image', 'desc'],
          through: { attributes: [] }
        },
        {
          model: Song,
          as: 'songs',
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
    const { name, releaseYear, artisteIds } = req.body;

    const album = await Album.findByPk(id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    // Parse artisteIds if provided
    if (artisteIds) {
      const artisteIdsArray = typeof artisteIds === 'string' 
        ? JSON.parse(artisteIds) 
        : artisteIds;

      if (artisteIdsArray.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one artiste is required'
        });
      }

      // Check if all artistes exist
      const artistes = await Artiste.findAll({
        where: {
          id: artisteIdsArray
        }
      });

      if (artistes.length !== artisteIdsArray.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more artistes not found'
        });
      }

      // Update artistes association
      await album.setArtistes(artisteIdsArray);
    }

    // Get new image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : album.image;

    await album.update({
      name: name || album.name,
      releaseYear: releaseYear !== undefined ? releaseYear : album.releaseYear,
      image: image
    });

    // Fetch updated album with artistes info
    const updatedAlbum = await Album.findByPk(id, {
      include: [
        {
          model: Artiste,
          as: 'artistes',
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] }
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