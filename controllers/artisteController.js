// import { Artiste, Album, Song } from '../models/index.js';

// // Create a new artiste
// export const createArtiste = async (req, res, next) => {
//   try {
//     const { name, image, desc } = req.body;

//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name is required'
//       });
//     }

//     const artiste = await Artiste.create({
//       name,
//       image,
//       desc
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Artiste created successfully',
//       data: artiste
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get all artistes
// export const getAllArtistes = async (req, res, next) => {
//   try {
//     const artistes = await Artiste.findAll({
//       order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//       success: true,
//       count: artistes.length,
//       data: artistes
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get artiste by ID
// export const getArtisteById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const artiste = await Artiste.findByPk(id, {
//       include: [
//         {
//           model: Album,
//           as: 'albums'
//         },
//         {
//           model: Song,
//           as: 'songs'
//         }
//       ]
//     });

//     if (!artiste) {
//       return res.status(404).json({
//         success: false,
//         message: 'Artiste not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: artiste
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Update artiste
// export const updateArtiste = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { name, image, desc } = req.body;

//     const artiste = await Artiste.findByPk(id);

//     if (!artiste) {
//       return res.status(404).json({
//         success: false,
//         message: 'Artiste not found'
//       });
//     }

//     await artiste.update({
//       name: name || artiste.name,
//       image: image !== undefined ? image : artiste.image,
//       desc: desc !== undefined ? desc : artiste.desc
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Artiste updated successfully',
//       data: artiste
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Delete artiste
// export const deleteArtiste = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const artiste = await Artiste.findByPk(id);

//     if (!artiste) {
//       return res.status(404).json({
//         success: false,
//         message: 'Artiste not found'
//       });
//     }

//     await artiste.destroy();

//     res.status(200).json({
//       success: true,
//       message: 'Artiste deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

import { Artiste, Album, Song } from '../models/index.js';

// Create a new artiste
export const createArtiste = async (req, res, next) => {
  try {
    const { name, desc } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Get image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const artiste = await Artiste.create({
      name,
      image,
      desc
    });

    res.status(201).json({
      success: true,
      message: 'Artiste created successfully',
      data: artiste
    });
  } catch (error) {
    next(error);
  }
};

// Get all artistes
export const getAllArtistes = async (req, res, next) => {
  try {
    const artistes = await Artiste.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: artistes.length,
      data: artistes
    });
  } catch (error) {
    next(error);
  }
};

// Get artiste by ID
export const getArtisteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const artiste = await Artiste.findByPk(id, {
      include: [
        {
          model: Album,
          as: 'albums'
        },
        {
          model: Song,
          as: 'songs'
        }
      ]
    });

    if (!artiste) {
      return res.status(404).json({
        success: false,
        message: 'Artiste not found'
      });
    }

    res.status(200).json({
      success: true,
      data: artiste
    });
  } catch (error) {
    next(error);
  }
};

// Update artiste
export const updateArtiste = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, desc } = req.body;

    const artiste = await Artiste.findByPk(id);

    if (!artiste) {
      return res.status(404).json({
        success: false,
        message: 'Artiste not found'
      });
    }

    // Get new image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : artiste.image;

    await artiste.update({
      name: name || artiste.name,
      image: image,
      desc: desc !== undefined ? desc : artiste.desc
    });

    res.status(200).json({
      success: true,
      message: 'Artiste updated successfully',
      data: artiste
    });
  } catch (error) {
    next(error);
  }
};

// Delete artiste
export const deleteArtiste = async (req, res, next) => {
  try {
    const { id } = req.params;

    const artiste = await Artiste.findByPk(id);

    if (!artiste) {
      return res.status(404).json({
        success: false,
        message: 'Artiste not found'
      });
    }

    await artiste.destroy();

    res.status(200).json({
      success: true,
      message: 'Artiste deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};