const request = require('supertest')
const app = require('../app')
const { 
        User,
        Photo,
        Comment,
        Sosmed
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

    const inValidSosmed = {
        nama: 'facebook',
        social_media_url: ''
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

        const sosmed = await Sosmed.create({
            nama: 'Facebook',
            social_media_url: 'https://facebook.com/testuser',
            UserId: testData.id,
        })
        
        createdSosmedId = sosmed.id
    })
    
    let authToken


// ************************************************* endpoint untuk test membuat social media ***********************************

describe('POST /socialmedias', () => {
    it('should be response 201 for success crated social media', async () => {
        const response = await request(app)
            .post('/socialmedias') 
            .set('Authorization', authToken)
            .send({
                nama: 'Facebook',
                social_media_url: 'https://facebook.com/testuser',
            })
        
        expect(response.status).toBe(201)
        expect(response.body.social_media).toBeDefined()
        expect(response.body.social_media.id).toBeDefined()
        expect(response.body.social_media.nama).toBe('Facebook')
        expect(response.body.social_media.social_media_url).toBe('https://facebook.com/testuser')
    })

    it('should be response 401 for error token is not provided', async () => {
        const response = await request(app)
            .post('/socialmedias') 
            .send({
                nama: 'Facebook',
                social_media_url: 'https://facebook.com/testuser',
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be response 500 for missing required data', async () => {
        const res = await request(app)
            .post('/socialmedias')
            .set('Authorization', authToken)
            .send(inValidSosmed)
    
        expect(res.status).toBe(500)
        expect(res.body).toEqual('Validation error: social media url harus di isi')
        expect(res.body).not.toHaveProperty('errors')
        expect(typeof res.body).toBe('string')
        expect(res.body).toMatch(/Validation error:/)
    })

})

// ************************************************* endpoint untuk test get social media ***********************************
describe('GET /socialmedias', () => {
    it('should be response 200 for success get socialmedias', async () => {
        const response = await request(app)
            .get('/socialmedias')
            .set('Authorization', authToken)

        expect(response.status).toBe(200)
        expect(response.body.social_media).toBeDefined()
        expect(response.body.social_media[0]).toHaveProperty('id')
        expect(response.body.social_media[0]).toHaveProperty('nama')
        expect(response.body.social_media[0]).toHaveProperty('social_media_url')
    })

    it('should be response 401 for error token is not provided', async () => {
        const response = await request(app)
            .get('/socialmedias')
        
        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })
})


// ************************************************* endpoint untuk test upadate social media ***********************************
describe('PUT /socialmedias/socialMediaId', () => {
    it('should be response 200 for success update social media', async () => {
        const response = await request(app)
            .put(`/socialmedias/${createdSosmedId}`)
            .set('Authorization', authToken)
            .send({
                nama: 'Updated Facebook',
                social_media_url: 'https://facebook.com/updateduser',
            })

        expect(response.status).toBe(200)
        expect(response.body.social_media).toBeDefined()
        expect(response.body.social_media.id).toBe(createdSosmedId)
        expect(response.body.social_media.nama).toBe('Updated Facebook')
        expect(response.body.social_media.social_media_url).toBe('https://facebook.com/updateduser')
    })

    it('should be response 401 for error token is not provided', async () => {
        const response = await request(app)
            .put(`/socialmedias/${createdSosmedId}`)
            .send({
                nama: 'Updated Facebook',
                social_media_url: 'https://facebook.com/updateduser',
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be response 404 for error social media not found', async () => {
        const response = await request(app)
            .put('/socialmedias/999')
            .set('Authorization', authToken)
            .send({
            nama: 'Updated Facebook',
                social_media_url: 'https://facebook.com/updateduser',
            });

        expect(response.status).toBe(404);
        expect(response.body).toEqual('Data tidak ditemukan atau Anda tidak memiliki izin untuk mengupdate data ini.')
        expect(response.body).not.toHaveProperty('error')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toHaveProperty('message')
    })

    it('should be response 401 for error user not authorized for update social media', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: unauthorizedUser.email,
                password: unauthorizedUser.password,
        })

        const response = await request(app)
            .put(`/socialmedias/${createdSosmedId}`)
            .set('Authorization', `Bearer ${loginResponse.body.token}`)
            .send({
                nama: 'sosmed update',
                social_media_url: 'https://sosialmediaupdate.com'
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual('Token tidak valid')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })
})


// ************************************************* endpoint untuk test upadate social media ***********************************
describe('DELETE /socialmediad/socialMediaId', () => {
    it('should be response 200 for success delete social media', async () => {
        const response = await request(app)
            .delete(`/socialmedias/${createdSosmedId}`)
            .set('Authorization', authToken)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toBe('Your sosial media has been succesfully deleted')
    })

    it('should be response 401 for error token is not provided', async () => {
        const response = await request(app)
            .delete(`/socialmedias/${createdSosmedId}`)

        expect(response.status).toBe(401)
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be response 401 for error user not authorized for delete social media', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: unauthorizedUser.email,
                password: unauthorizedUser.password,
        })

        const response = await request(app)
            .delete(`/socialmedias/${createdSosmedId}`)
            .set('Authorization', `Bearer ${loginResponse.body.token}`)
            .send({
                nama: 'sosmed update',
                social_media_url: 'https://sosialmediaupdate.com'
            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual('Token tidak valid')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
        expect(response.body).toBeDefined()
    })

    it('should be responses 404 for error social media not found', async () => {
        const response = await request(app)
            .delete(`/socialmedias/999`)
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
})