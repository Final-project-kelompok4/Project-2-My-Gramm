const {
    User,
    Photo,
    Comment,
    Sosmed
} = require("../models")

class SosmedController {

    static async addSosmed(req, res) {
        try {
            const { nama, social_media_url } = req.body;

            const userData = req.userData 

            const sosmed = await Sosmed.create({
                nama, social_media_url, UserId: userData.id
            })
            
            res.status(201).json({ social_media : {
                id: sosmed.id,
                nama: sosmed.nama,
                social_media_url: sosmed.social_media_url,
                UserId: userData.id,
                updatedAt: sosmed.updatedAt,
                createdAt: sosmed.createdAt,
            }
                
            })

        } catch (error) {
            res.status(error.code || 500).json(error.message);
        }
    }


    static async getOwnSosmed(req, res){
        try {
            
            const userData = req.userData

            const sosmed = await Sosmed.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username', 'profile_image_url'],
                        where: {
                            id: userData.id,
                        },
                    },
                ],
            });

            res.status(200).json({ social_media : sosmed})

        } catch (error) {
            res.status(error.code || 500).json(error.message);
        }
    }


    static async updateSosmed(req, res) {
        try {
            

            const {
                nama, social_media_url
            } = req.body

            const { id } = req.params

            const userData = req.userData

            const [updatedRowCount, [updatedSosmed]] = await Sosmed.update(
                {
                    nama,
                    social_media_url,
                },
                {
                    where: {
                        id: id,
                        UserId: userData.id,
                    },
                        returning: true,
                }
            );
        
            if (updatedRowCount === 0) {
                throw {
                    code: 404,
                    message: 'Data tidak ditemukan atau Anda tidak memiliki izin untuk mengupdate data ini.',
                };
            }

            const response = {
                social_media: {
                    id: updatedSosmed.id,
                    nama: updatedSosmed.nama,
                    social_media_url: updatedSosmed.social_media_url,
                    UserId: updatedSosmed.UserId,
                    updatedAt: updatedSosmed.updatedAt,
                    createdAt: updatedSosmed.createdAt,
                }
            };

            res.status(200).json(response);

        } catch (error) {
            res.status(error.code || 500).json(error.message);
        }
    }


    static async deleteSosmed(req, res) {
        try {
            
            const { id } = req.params

            const userData = req.userData

            const data = await Sosmed.destroy({
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

            res.status(200).json({message : "Your sosial media has been succesfully deleted"})

        } catch (error) {
            res.status( error.code || 500).json(error.message)
        }
    }

}

module.exports = SosmedController