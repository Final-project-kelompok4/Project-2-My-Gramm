const { 
    User,
    Comment,
    Photo
} = require("../models")

class CommentController {

    static async createComment(req, res) {

        try {
            const { comment, PhotoId } = req.body;

            const { id: UserId } = req.userData 

            const photo = await Photo.findByPk(PhotoId)

            if (!photo) {
                throw {
                    code: 404,
                    message: 'Photo tidak ditemukan',
                };
            }

            const newComment = await Comment.create({ comment, PhotoId, UserId })

            res.status(201).json({ newComment })

        } catch (error) {
            res.status(error.code || 500).json(error.message);
        }

    }

    static async getOwnComments(req, res) {
        try {
            const { id } = req.userData;

            const comments = await Comment.findAll({
                include: [
                    {
                        model: Photo,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
                            },
                        ],
                    },
                ],
                where: {
                    UserId: id
                },
            });
    
            const commentsData = comments.map(comment => {
            const photo = comment.Photo;
            const user = photo.User;
    
            return {
                id: comment.id,
                comment: comment.comment,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                UserId: comment.UserId,
                PhotoId: comment.PhotoId,
                Photo: {
                    id: photo.id,
                    title: photo.title,
                    caption: photo.caption,
                    poster_img_url: photo.poster_img_url,
                },
                User: {
                    id: user.id,
                    username: user.username,
                    profile_image_url: user.profile_image_url,
                    phone_number: user.phone_number,
                },
                };
            });
    
            if (commentsData.length === 0) {
                return res.status(404).json({ message: 'Tidak ada komentar untuk pengguna ini.' });
            }
    
            res.status(200).json({ comments: commentsData });
        } catch (error) {
            console.error(error);
            res.status(error.code || 500).json({ error: error.message });
        }
    }


    static async updateComment(req, res) {
        try {
            const { comment } = req.body;
            const { id } = req.params;
            const { userId } = req.userData

            const userData = req.userData
    
            const [updatedRowCount, [updatedComment]] = await Comment.update(
                {
                    comment: comment,
                },
                {
                    where: {
                    id: id,
                    UserId: userData.id
                    },
                    returning: true,
                }
            );

            if (updatedRowCount === 0) {
                throw {
                    code: 404,
                    message: 'Data tidak ada',
                };
            }

            // Membuat respons sesuai dengan format yang diinginkan
            const response = {
                comments: {
                    id: updatedComment.id,
                    comment: updatedComment.comment,
                    UserId: updatedComment.UserId,
                    PhotoId: updatedComment.PhotoId,
                    updatedAt: updatedComment.updatedAt,
                    createdAt: updatedComment.createdAt,
                },
            };

            res.status(201).json(response);
        } catch (error) {
            console.error(error);
            res.status(error.code || 500).json(error.message);
        }
    }


    static async deleteComment(req, res) {
        try {
            
            const { id } = req.params

            const userData = req.userData

            const data = await Comment.destroy({
                where: {
                    id: id,
                    UserId: userData.id
                }
            })

            if (!data) {
                throw {
                    code: 404,
                    message: "Data tidak ada"
                }
            }

            res.status(200).json({message : "Your comment has been succesfully deleted"})

        } catch (error) {
            res.status( error.code || 500).json(error.message)
        }
    }
    

}

module.exports = CommentController