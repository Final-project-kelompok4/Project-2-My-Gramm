const request = require('supertest')
const app = require('../app')
const { 
        User,
        Photo,
        Comment
    } = require('../models')

    const testData = {
        id: 1,
        full_name: 'muh adnan',
        email: 'adnan@gmail.com',
        username: 'adnan',
        password: 'adnan',
        profile_image_url: 'example.com/adnan.jpg',
        age: 25,
        phone_number: '1234567890',
    }

    const unauthorizedUser = {
        full_name: 'riskaput',
        email: 'riska@gmailcom',
        username: 'riska',
        password: 'riska',
        profile_image_url: 'example.com/riska.jpg',
        age: 20,
        phone_number: '1234567890',
    }

    beforeAll(async () => {
        await User.create(testData)
        
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: testData.email,
                password: testData.password,
        })
        
        authToken = loginResponse.body.token

        const photo = await Photo.create({
            title: 'Sample Title',
            caption: 'Sample Caption',
            poster_img_url: 'https://example.com/sample.jpg',
            UserId: testData.id,
        });
        
        createdPhotoId = photo.id

        const comment = await Comment.create({
            comment: 'Ini adalah komentar test',
            UserId: testData.id,
            PhotoId: createdPhotoId,
        });
        
        createdCommentId = comment.id
    });
    
    let authToken

// ************************************************* endpoint untuk test post comments ***********************************
describe('POST /comments', () => {
    it('should be response 201 for success created comments', async () => {
        const response = await request(app)
            .post('/comments')
            .set('Authorization', authToken)
            .send({
                comment: 'Ini adalah komentar baru',
                PhotoId: createdPhotoId,
            })

        expect(response.status).toBe(201)
        expect(response.body.newComment).toBeDefined()
        expect(response.body.newComment.comment).toBe('Ini adalah komentar baru')
        expect(response.body.newComment.PhotoId).toBe(createdPhotoId)
        expect(response.body.newComment.UserId).toBe(1)
    })

    it('should be response 404 for error photoid not found', async () => {
        const response = await request(app)
            .post('/comments')
            .set('Authorization', authToken)
            .send({
                comment: 'Ini adalah komentar baru',
                PhotoId: 999,
            })

        expect(response.status).toBe(404)
        expect(response.body).toEqual('Photo tidak ditemukan')
        expect(response.body).not.toHaveProperty('error')
        expect(response.body).not.toHaveProperty('message')
        expect(typeof response.body).toBe('string')
    })

    it('should be response 401 for error token is not provided', async () => {
        const response = await request(app)
            .post('/comments')
            .send({
                comment: 'ini comment saya',
                PhotoId: createdPhotoId
            })
        
        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })
})



// ************************************************* endpoint untuk test get comments ***********************************
describe('GET /comments', () => {
    it('should be response 200 for success get comments', async () => {
        const response = await request(app)
            .get('/comments')
            .set('Authorization', authToken)

        expect(response.status).toBe(200)
        expect(response.body.comments).toBeDefined()
        expect(response.body.comments[0].id).toBeDefined()
        expect(response.body.comments[0].comment).toBeDefined()
        expect(response.body.comments[0].Photo).toBeDefined()

    })

    it('should be response 401 for error token is not provided', async () => {
        const response = await request(app)
            .get('/comments')
        
        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })
})



// ************************************************* endpoint untuk test upadate comments ***********************************
describe('PUT /comments/commentId', () => {
    it('should be response 200 for success updated comments', async () => {
        const response = await request(app)
            .put(`/comments/${createdCommentId}`)
            .set('Authorization', authToken)
            .send({
                comment: 'Ini adalah komentar yang diperbarui',
            })

        expect(response.status).toBe(200)
        expect(response.body.comments).toBeDefined()
        expect(response.body.comments.comment).toBe('Ini adalah komentar yang diperbarui')
        expect(response.body.comments.id).toBeDefined()
        expect(response.body.comments.UserId).toBeDefined()
    })

    it('should be response 404 for error comment not found', async () => {
        const response = await request(app)
        .put(`/comments/999`)
        .set('Authorization', authToken)
        .send({
            comment: 'Ini adalah komentar yang diperbarui',
        })

        expect(response.status).toBe(404);
        expect(response.body).toEqual('Data tidak ada')
        expect(response.body).not.toHaveProperty('error')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toHaveProperty('message')
    })

    it('should be response 401 for error token is not provided', async () => {
        const response = await request(app)
            .put(`/comments/${createdCommentId}`)
            .send({
                comment: 'Ini adalah komentar yang diperbarui',
            })

        expect(response.status).toBe(401);
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be response 401 for error user is not authorized to update the comment', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: unauthorizedUser.email,
                password: unauthorizedUser.password,
        })

        const response = await request(app)
            .put(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${loginResponse.body.token}`)
            .send({
                comment: 'Ini adalah komentar yang diperbarui',
            });

        expect(response.status).toBe(401)
        expect(response.body).toEqual('Token tidak valid')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })
})



// ************************************************* endpoint untuk test delete comments ***********************************
describe('DELETE /comments/commentId', () => {
    it('should be response 200 for success deleted comment', async () => {
        const response = await request(app)
            .delete(`/comments/${createdCommentId}`)
            .set('Authorization', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toBe('Your comment has been succesfully deleted')
    })

    it('should be response 401 for error token is not provided', async () => {
        const response = await request(app)
            .delete(`/comments/${createdCommentId}`)

        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be response 401 for error user is not authorized to delete the comment', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: unauthorizedUser.email,
                password: unauthorizedUser.password,
        });

        const response = await request(app)
            .delete(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${loginResponse.body.token}`)

        expect(response.status).toBe(401)
        expect(response.body).toEqual('Token tidak valid')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be responses 404 for error comment not found', async () => {
        const response = await request(app)
            .delete(`/comments/99`)
            .set('Authorization', authToken)

        expect(response.status).toBe(404)
        expect(response.body).toEqual('Data tidak ada')
        expect(response.body).not.toHaveProperty('error')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toHaveProperty('message')
    })
})


afterAll(async () => {
    await User.destroy({
        where: {
            email: testData.email,
        },
    })

    if (createdPhotoId) {
        await Photo.destroy({
            where: {
                id: createdPhotoId,
            },
        });
    }
})