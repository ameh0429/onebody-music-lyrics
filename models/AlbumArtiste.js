
// models/AlbumArtiste.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const AlbumArtiste = sequelize.define('AlbumArtiste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  albumId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  artisteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'artistes',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'album_artistes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['albumId', 'artisteId']
    }
  ]
});

export default AlbumArtiste;