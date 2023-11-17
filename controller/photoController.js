const {
    User,
    Photo,
    Comment
} = require("../models")

class PhotoController{

    static async getPhoto(req, res) {

        try {
            const userData = req.userData;

            // Ambil data foto bersama dengan komentar dan informasi pengguna yang terkait
            const photos = await Photo.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username', 'profile_image_url'],
                        where: {
                            id: userData.id,
                        },
                    },
                    {
                        model: Comment,
                        attributes: ['comment'],
                        include: [
                            {
                                model: User,
                                attributes: ['username'],
                            },
                        ],
                    },
                ],
            });

            const formattedPhotos = photos.map(photo => {
                return {
                    id: photo.id,
                    title: photo.title,
                    caption: photo.caption,
                    poster_img_url: photo.poster_img_url,
                    UserId: photo.UserId,
                    createdAt: photo.createdAt,
                    updatedAt: photo.updatedAt,
                    Comments: photo.Comments.map(comment => {
                        return {
                            comment: comment.comment,
                            User: {
                                username: comment.User.username,
                            },
                        };
                    }),
                    User: {
                        id: photo.User.id,
                        username: photo.User.username,
                        profile_image_url: photo.User.profile_image_url,
                    },
                };
            });
            
            res.status(200).json({ photos: formattedPhotos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }

    }

    static async createPhoto(req, res) {
        try {
            const { title, caption, poster_img_url } = req.body;

            const userData = req.userData
        
            const photo = await Photo.create({ title, caption, poster_img_url, UserId: userData.id });
        
            return res.status(201).json({ 
                id: photo.id,
                poster_img_url: photo.poster_img_url,
                title: photo.title,
                caption: photo.caption,
                UserId: userData.id
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updatePhoto(req, res) {
        try {
            const { id } = req.params;
            const { title, caption, poster_img_url } = req.body;
        
            const userData = req.userData;
        
            // Cek apakah foto dengan ID yang sesuai ada
            const photo = await Photo.findOne({
                where: {
                id: id,
                UserId: userData.id,
                },
            });
        
            if (!photo) {
                throw {
                code: 404,
                message: 'tidak ditemukan',
                };
            }
        
            // Update data foto
            await photo.update({ title, caption, poster_img_url });
        
            // Kirim respons dengan data foto yang telah diperbarui
            res.status(200).json(photo);
        } catch (error) {
            console.error(error);
            res.status(error.code || 500).json(error.message);
        }
    }


    static async deletePhoto(req, res) {
        try {
            const { id } = req.params;
        
            const userData = req.userData;
        
            // Cek apakah foto dengan ID yang sesuai ada
            const photo = await Photo.findOne({
                where: {
                id: id,
                UserId: userData.id,
                },
            });
        
            if (!photo) {
                throw {
                code: 404,
                message: 'Photo tidak ada',
                };
            }
        
            // Hapus foto
            await photo.destroy();
        
            // Kirim respons tanpa data (204 No Content)
            res.status(201).json({ message: "Your photo has been successfully deleted" });
        } catch (error) {
            console.error(error);
            res.status(error.code || 500).json(error.message);
        }
    }

}

module.exports = PhotoController