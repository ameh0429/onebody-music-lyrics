// models/SongArtiste.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SongArtiste = sequelize.define('SongArtiste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  songId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'songs',
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
  tableName: 'song_artistes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['songId', 'artisteId']
    }
  ]
});

export default SongArtiste;