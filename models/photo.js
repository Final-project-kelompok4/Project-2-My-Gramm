'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Photo.belongsTo(models.User, { foreignKey: "UserId" })
      Photo.hasMany(models.Comment, { foreignKey: "PhotoId" })
    }
  }
  Photo.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Title tidak boleh kosong"
        }
      } 
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Caption tidak boleh kosong"
        }
      }
    },
    poster_img_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Poster image url tidak boleh kosong"
        },
        isUrl: {
          args: true,
          msg: "Format URL tidak valid"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Photo',
  });
  return Photo;
};