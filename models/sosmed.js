'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sosmed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Sosmed.belongsTo(models.User, { foreignKey: "UserId" })
    }
  }
  Sosmed.init({
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "nama harus di isi"
        }
      }
    },
    social_media_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "social media url harus di isi"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Sosmed',
  });
  return Sosmed;
};