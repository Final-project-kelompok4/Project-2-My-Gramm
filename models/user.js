'use strict';
const {
  Model
} = require('sequelize');

const {
  hashPassword
} = require("../utils/bcrypt")
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Photo, { foreignKey: "UserId" })
      User.hasMany(models.Comment, { foreignKey: "UserId" })
      User.hasMany(models.Sosmed, { foreignKey: "UserId" })
    }
  }
  User.init({
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Nama lengkap harus terisi tidak boleh kosong"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          args: true,
          msg: 'Format email tidak valid',
        },
        notEmpty: {
          args: true,
          msg: 'Email tidak boleh kosong',
        },
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Username tidak boleh kosong"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Password tidak boleh kosong"
        }
      }
    },
    profile_image_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Profil image url tidak boleh kosong"
        },
        isUrl: {
          args: true,
          msg: "Format URL tidak valid"
        }
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "umur tidak boleh kosong"
        },
        isInt: {
          args: true,
          msg: "Umur harsu diisi dengan nilai integer"
        }
      }
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "No Hp tidak boleh kosong"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: (user) => {
        const hashedPassword = hashPassword(user.password)

        user.password = hashedPassword
      }
    }
  });
  return User;
};