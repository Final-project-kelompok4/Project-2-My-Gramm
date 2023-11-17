const { verifyToken } = require("../utils/jwt")
const { User } = require("../models")

const authenticateToken = async(req, res, next) => {
    try {
        const token = req.headers['authorization'];
    
        if (!token) {
            throw {
                code: 401,
                message: "token tidak disediakan"
            }
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            throw {
                code: 401,
                message: "Token tidak valid"
            };
        }
        
        
        const userData = await User.findOne({
            where : {
                id: decoded.id,
                email: decoded.email,
            }
        })

        if(!userData || !userData.id) {
            throw {
                code : 401,
                message: "User tidak ditemukan"
            }
        }



        req.userData = {
            id: userData.id,
            email: userData.email,
            profile_image_url: userData.profile_image_url
        }

        console.log('req.user:', req.userData)
    
        next();

    } catch (error) {
        console.error(error)
        res.status(error.code || 401).json(error.message)
    }
}

module.exports = { authenticateToken }


 // const resourceId = req.params.id; // Ambil ID dari parameter permintaan

        // if (userData.id !== parseInt(resourceId)) {
        //     throw {
        //         code: 403,
        //         message: "Anda tidak memiliki akses"
        //     }
        // }