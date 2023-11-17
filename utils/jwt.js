const jwt = require("jsonwebtoken")
require("dotenv").config()
const SECRET_KEY = process.env.SECRET_KEY



function generateToken(payload) {
    return jwt.sign(payload, SECRET_KEY)
}

function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY)
}

// function verifyToken(token) {
//     return new Promise((resolve, reject) => {
//         jwt.verify(token, SECRET_KEY, (err, decoded) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(decoded);
//             }
//         });
//     });
// }


module.exports = {
    generateToken,
    verifyToken
}