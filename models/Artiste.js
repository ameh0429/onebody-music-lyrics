import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Artiste = sequelize.define('Artiste', {
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
        msg: 'Name is required'
      }
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'artistes',
  timestamps: true
});

export default Artiste;