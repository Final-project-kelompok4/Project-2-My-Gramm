const { User } = require('../models');
// const { checkUserOwnership, authenticateToken } = require("../middleware/auth")
const { generateToken } = require("../utils/jwt");
const { comparePassword } = require("../utils/bcrypt")

class UserController {
    static async registerUser (req, res) {
        try {
            
            const { full_name, email, username, password, profile_image_url, age, phone_number } = req.body

            // Hash password
            // const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                email,
                full_name,
                username,
                password,
                profile_image_url,
                age,
                phone_number
            });

            res.status(201).json({ user: {
                email: newUser.email,
                full_name: newUser.full_name,
                username: newUser.username,
                profile_image_url: newUser.profile_image_url,
                age: newUser.age,
                phone_number: newUser.phone_number
            } });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // ENDPOINT LOGIN**************************************************************************************
    static async login (req, res) {
        try {
            
            const {
                email,
                password
            } = req.body

            const user = await User.findOne({
                where : {
                    email: email
                }
            })

            if (!user) {
                throw {
                    code: 404,
                    message: "User tidak terdaftar"
                }
            }

            const isValid = comparePassword(password, user.password)

            if (!isValid) {
                throw {
                    code: 401,
                    message: "Password Salah"
                }
            }

            
            const token = generateToken({
                id: user.id,
                email: user.email
            })

            res.status(200).json({ message: 'Login successful', token });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // Endpoint Update User
    static async updateUser(req, res) {

        try {
            
            const { id } = req.params
            
            const { full_name, email, username, profile_image_url, age, phone_number } = req.body

            const userData = req.userData

            // Hanya update field yang tidak kosong
            const updateData = {
                full_name,
                email,
                username,
                profile_image_url,
                age,
                phone_number
            };


            const [numOfUpdatedRows, [updatedUser]] = await User.update(updateData, {
                where: {
                    id: id,
                    email: userData.email
                },
                returning: true
            });

            if (numOfUpdatedRows === 0) {
                return res.status(404).json({ error: "User not found." });
            }

            

            res.status(200).json({ user: {
                email: updatedUser.email,
                full_name: updatedUser.full_name,
                username: updatedUser.username,
                profile_image_url: updatedUser.profile_image_url,
                age: updatedUser.age,
                phone_number: updatedUser.phone_number
            } });

        } catch (error) {
            res.status( error.code || 500).json(error.message)
        }

    } 


    // ENDPOINT HAPUS USER 
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const userData = req.userData;
    
            // Pastikan hanya pengguna yang sedang diautentikasi yang dapat menghapus data
            if (parseInt(id) !== userData.id) {
                return res.status(403).json({ error: "Anda hanya bisa menghapus id anda sendiri" });
            }
    
            // Hapus pengguna
            const numOfDeletedRows = await User.destroy({
                where: {
                    id: userData.id
                }
            });
    
            if (numOfDeletedRows === 0) {
                return res.status(404).json({ error: "User not found." });
            }
    
            res.status(200).json({ message: "Your account has been succesfully deleted" });
        } catch (error) {
            console.error(error);
            res.status(error.code || 500).json({ error: error.message });
        }
    }

}

module.exports = UserController