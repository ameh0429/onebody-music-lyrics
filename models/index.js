// import Artiste from './Artiste.js';
// import Album from './Album.js';
// import Song from './Song.js';
// import AlbumArtiste from './AlbumArtiste.js';
// import SongArtiste from './SongFeaturedArtiste.js';

// // Define many-to-many associations

// // Artiste <-> Album (many-to-many through AlbumArtiste)
// Artiste.belongsToMany(Album, {
//   through: AlbumArtiste,
//   foreignKey: 'artisteId',
//   otherKey: 'albumId',
//   as: 'albums'
// });

// Album.belongsToMany(Artiste, {
//   through: AlbumArtiste,
//   foreignKey: 'albumId',
//   otherKey: 'artisteId',
//   as: 'artistes'
// });

// // Artiste <-> Song (many-to-many through SongArtiste)
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

// // Album -> Songs (one-to-many)
// Album.hasMany(Song, {
//   foreignKey: 'albumId',
//   as: 'songs',
//   onDelete: 'SET NULL'
// });

// Song.belongsTo(Album, {
//   foreignKey: 'albumId',
//   as: 'album'
// });

// export { Artiste, Album, Song, AlbumArtiste, SongArtiste };


import Artiste from './Artiste.js';
import Album from './Album.js';
import Song from './Song.js';
import AlbumArtiste from './AlbumArtiste.js';
import SongFeaturedArtiste from './SongFeaturedArtiste.js';
import User from './User.js';

// Album <-> Artiste (many-to-many through AlbumArtiste)
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

// Song -> Main Artiste (one-to-many)
Artiste.hasMany(Song, {
  foreignKey: 'artisteId',
  as: 'mainSongs'
});

Song.belongsTo(Artiste, {
  foreignKey: 'artisteId',
  as: 'mainArtiste'
});

// Song <-> Featured Artistes (many-to-many through SongFeaturedArtiste)
Song.belongsToMany(Artiste, {
  through: SongFeaturedArtiste,
  foreignKey: 'songId',
  otherKey: 'artisteId',
  as: 'featuredArtistes'
});

Artiste.belongsToMany(Song, {
  through: SongFeaturedArtiste,
  foreignKey: 'artisteId',
  otherKey: 'songId',
  as: 'featuredSongs'
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

export { Artiste, Album, Song, AlbumArtiste, SongFeaturedArtiste, User };