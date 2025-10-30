import Artiste from './Artiste.js';
import Album from './Album.js';
import Song from './Song.js';

// Define associations

// Artiste has many Albums
Artiste.hasMany(Album, {
  foreignKey: 'artisteId',
  as: 'albums',
  onDelete: 'CASCADE'
});

Album.belongsTo(Artiste, {
  foreignKey: 'artisteId',
  as: 'artiste'
});

// Artiste has many Songs
Artiste.hasMany(Song, {
  foreignKey: 'artisteId',
  as: 'songs',
  onDelete: 'CASCADE'
});

Song.belongsTo(Artiste, {
  foreignKey: 'artisteId',
  as: 'artiste'
});

// Album has many Songs
Album.hasMany(Song, {
  foreignKey: 'albumId',
  as: 'songs',
  onDelete: 'SET NULL'
});

Song.belongsTo(Album, {
  foreignKey: 'albumId',
  as: 'album'
});

export { Artiste, Album, Song };