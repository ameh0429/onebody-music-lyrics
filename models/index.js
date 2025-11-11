// import Artiste from './Artiste.js';
// import Album from './Album.js';
// import { Song, SongArtiste } from './Song.js';

// // Define associations

// // Artiste has many Albums
// Artiste.hasMany(Album, {
//   foreignKey: 'artisteId',
//   as: 'albums',
//   onDelete: 'CASCADE'
// });

// Album.belongsTo(Artiste, {
//   foreignKey: 'artisteId',
//   as: 'artiste'
// });

// // // Artiste has many Songs
// // Artiste.hasMany(Song, {
// //   foreignKey: 'artisteId',
// //   as: 'songs',
// //   onDelete: 'CASCADE'
// // });

// // Song.belongsTo(Artiste, {
// //   foreignKey: 'artisteId',
// //   as: 'artiste'
// // });

// // Many-to-Many: Artistes <-> Songs
// Artiste.belongsToMany(Song, {
//   through: SongArtiste,
//   foreignKey: 'artisteId',
//   otherKey: 'songId',
//   as: 'songs'
// });

// Song.belongsToMany(Artiste, {
//   through: SongArtiste,
//   foreignKey: 'songId',
//   otherKey: 'artisteId',
//   as: 'artistes'
// });

// // Album has many Songs
// Album.hasMany(Song, {
//   foreignKey: 'albumId',
//   as: 'songs',
//   onDelete: 'SET NULL'
// });

// Song.belongsTo(Album, {
//   foreignKey: 'albumId',
//   as: 'album'
// });

// export { Artiste, Album, Song };

import Artiste from './Artiste.js';
import Album from './Album.js';
import Song from './Song.js';
import AlbumArtiste from './AlbumArtiste.js';
import SongArtiste from './SongArtiste.js';

// Define many-to-many associations

// Artiste <-> Album (many-to-many through AlbumArtiste)
Artiste.belongsToMany(Album, {
  through: AlbumArtiste,
  foreignKey: 'artisteId',
  otherKey: 'albumId',
  as: 'albums'
});

Album.belongsToMany(Artiste, {
  through: AlbumArtiste,
  foreignKey: 'albumId',
  otherKey: 'artisteId',
  as: 'artistes'
});

// Artiste <-> Song (many-to-many through SongArtiste)
Artiste.belongsToMany(Song, {
  through: SongArtiste,
  foreignKey: 'artisteId',
  otherKey: 'songId',
  as: 'songs'
});

Song.belongsToMany(Artiste, {
  through: SongArtiste,
  foreignKey: 'songId',
  otherKey: 'artisteId',
  as: 'artistes'
});

// Album -> Songs (one-to-many)
Album.hasMany(Song, {
  foreignKey: 'albumId',
  as: 'songs',
  onDelete: 'SET NULL'
});

Song.belongsTo(Album, {
  foreignKey: 'albumId',
  as: 'album'
});

export { Artiste, Album, Song, AlbumArtiste, SongArtiste };