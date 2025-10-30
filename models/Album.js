import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Album = sequelize.define('Album', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Album name is required'
      }
    }
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
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1900],
        msg: 'Release year must be 1900 or later'
      },
      max: {
        args: [new Date().getFullYear() + 1],
        msg: 'Release year cannot be in the distant future'
      }
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'albums',
  timestamps: true
});

export default Album;