const request = require('supertest')
const app = require('../app')
const { 
        User,
        Photo
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
    };

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
    });
    
    let authToken

// ************************************************* endpoint untuk test post photos ***********************************
describe('POST /photos', () => {
    it('should be response 201 for succes add photo', async () => {
        const response = await request(app)
        .post('/photos')
        .set('Authorization', authToken)
        .send({
            title: 'Sample Title',
            caption: 'Sample Caption',
            poster_img_url: 'https://example.com/sample.jpg',
        });

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('id')
        expect(response.body).toHaveProperty('title', 'Sample Title')
        expect(response.body).toHaveProperty('caption', 'Sample Caption')
        expect(response.body).toHaveProperty('poster_img_url', 'https://example.com/sample.jpg')

        createdPhotoId = response.body.id
    })

    it('should be response 401 for error token not provided', async () => {
        const response = await request(app)
            .post('/photos')
            .send({
                title: 'Sample Title',
                caption: 'Sample Caption',
                poster_img_url: 'https://example.com/sample.jpg',
            });

        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
        
    })

    it('should be response 401 for error token invalid provided', async () => {
        const response = await request(app)
            .post('/photos')
            .set('Authorization', 'Bearer invalidToken')
            .send({
                title: 'Sample Title',
                caption: 'Sample Caption',
                poster_img_url: 'https://example.com/sample.jpg',
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual('Token tidak valid')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })
})


// ************************************************* endpoint untuk test get photos ***********************************
describe('GET /photos', () => {
    it('should be response 200 for succes get photos', async () => {
        const response = await request(app)
            .get('/photos')
            .set('Authorization', authToken)
            
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('photos')
        expect(response.body.photos).toBeInstanceOf(Array)

        const firstPhoto = response.body.photos[0]
        expect(firstPhoto).toHaveProperty('id')
        expect(firstPhoto).toHaveProperty('title')
        expect(firstPhoto).toHaveProperty('caption')
        expect(firstPhoto).toHaveProperty('poster_img_url')
        expect(firstPhoto).toHaveProperty('UserId')
    })

    it('should be response 401 for error no token is provided', async () => {
        const response = await request(app)
            .get('/photos')
    
        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })
})


// ************************************************* endpoint untuk test update photos ***********************************
describe('PUT /photos/photoId', () => {
    it('should be response 200 for success updated photo', async () => {
        const response = await request(app)
            .put(`/photos/${createdPhotoId}`)
            .set('Authorization', authToken)
            .send({
                title: 'Updated Title',
                caption: 'Updated Caption',
                poster_img_url: 'https://example.com/updated.jpg',
            });

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('id', createdPhotoId)
        expect(response.body).toHaveProperty('title', 'Updated Title')
        expect(response.body).toHaveProperty('caption', 'Updated Caption')
        expect(response.body).toHaveProperty('poster_img_url', 'https://example.com/updated.jpg')
    })

    it('should be responses 404 for error photo not found', async () => {
        const nonExistingPhotoId = createdPhotoId + 1
        const response = await request(app)
            .put(`/photos/${nonExistingPhotoId}`)
            .set('Authorization', authToken)
            .send({
                title: 'Updated Title',
                caption: 'Updated Caption',
                poster_img_url: 'https://example.com/updated.jpg',
            });

        expect(response.status).toBe(404)
        expect(response.body).toEqual('tidak ditemukan')
        expect(response.body).not.toHaveProperty('error')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toHaveProperty('message')
    })

    it('should be response 401 for error no token is provided', async () => {
        const response = await request(app)
            .put(`/photos/${createdPhotoId}`)
            .send({
                title: 'Updated Title',
                caption: 'Updated Caption',
                poster_img_url: 'https://example.com/updated.jpg',
            })

        expect(response.status).toBe(401);
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be response 401 for error user is not authorized to update the photo', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: unauthorizedUser.email,
                password: unauthorizedUser.password,
        })

        const response = await request(app)
            .put(`/photos/${createdPhotoId}`)
            .set('Authorization', `Bearer ${loginResponse.body.token}`)
            .send({
                title: 'Updated Title',
                caption: 'Updated Caption',
                poster_img_url: 'https://example.com/updated.jpg',
            });

        expect(response.status).toBe(401)
        expect(response.body).toEqual('Token tidak valid')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })
})


// ************************************************* endpoint untuk test delete photos ***********************************
describe('DELETE /photos/photoId', () => {
    it('should be response 200 for succes delete photos', async () => {
        const response = await request(app)
            .delete(`/photos/${createdPhotoId}`)
            .set('Authorization', authToken)

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toEqual('Your photo has been successfully deleted')
    })

    it('should be response 401 for error no token is provided', async () => {
        const response = await request(app)
            .delete(`/photos/${createdPhotoId}`)

        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be response 401 for error user is not authorized to delete the photo', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: unauthorizedUser.email,
                password: unauthorizedUser.password,
        });

        const response = await request(app)
            .delete(`/photos/${createdPhotoId}`)
            .set('Authorization', `Bearer ${loginResponse.body.token}`)

        expect(response.status).toBe(401)
        expect(response.body).toEqual('Token tidak valid')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be responses 404 for error photo not found', async () => {
        const nonExistingPhotoId = createdPhotoId + 1
        const response = await request(app)
            .put(`/photos/${nonExistingPhotoId}`)
            .set('Authorization', authToken)

        expect(response.status).toBe(404)
        expect(response.body).toEqual('tidak ditemukan')
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