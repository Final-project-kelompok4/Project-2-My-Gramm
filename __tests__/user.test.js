const request = require('supertest')
const app = require('../app')
const { User } = require('../models')

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

const invalidData = {
    full_name: 'riskaput',
    email: 'riskagmailcom',
    username: 'riska',
    password: 'riska',
    profile_image_url: 'example.com/riska.jpg',
    age: 20,
    phone_number: '1234567890',
}

// ************************************************* endpoint untuk test register ***********************************
describe('POST /users/register', () => {
    it('should be response 201 for succes created users', (done) => {
        
        request(app)
            .post("/users/register")
            .send(testData)
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);

                expect(res.body).toHaveProperty("user")
                expect(res.body.user).toHaveProperty("email", testData.email)
                expect(res.body.user).toHaveProperty("full_name", testData.full_name)
                expect(res.body.user).toHaveProperty("username", testData.username)
                expect(res.body.user).toHaveProperty("profile_image_url", testData.profile_image_url)
                expect(res.body.user).toHaveProperty("age", testData.age)
                expect(res.body.user).toHaveProperty("phone_number", testData.phone_number)

                done()
            })
        })

        it('should be response 500 for missing required data', async () => {
            const testDataWithError = invalidData

            const res = await request(app)
                .post('/users/register')
                .send(testDataWithError)
        
                expect(res.status).toBe(500)
                expect(res.body).toHaveProperty('error')
                expect(typeof res.body.error).toBe('string')
                expect(res.body.error).toEqual('Validation error: Format email tidak valid')
                expect(res.body).not.toHaveProperty('user')
        });

        afterAll(async () => {
            try {
                    await User.destroy({where: {}})
            } catch (error) {
                console.log(error)
            }
        })
});

// ************************************************* endpoint untuk test login user ***********************************
describe('POST /users/login', () => {
    beforeAll(async () => {
        await User.create(testData);
    });

    it('should be response 200 for success login and return token', async () => {

        const response = await request(app)
            .post('/users/login')
            .send({
                email: testData.email,
                password: testData.password,
            })
            .expect(200);
    
            expect(response.body).toHaveProperty('message', 'Login successful')
            expect(response.body).toHaveProperty('token')
            expect(response.body.token).toBeTruthy()
            expect(response.body).not.toHaveProperty('error')
            expect(response.status).toBe(200)
    });

    it('should be response 401 for error wrong password', async () => {
        const response = await request(app)
            .post("/users/login")
            .send({
                email: testData.email,
                password: "salapassword"
            })
            .expect(401)
            expect(response.body).toEqual('Password Salah')
            expect(response.body).not.toHaveProperty('token')
            expect(response.body).not.toHaveProperty('user')
            expect(response.status).toBe(401)
            expect(response.header).not.toHaveProperty('set-cookie')
    });

    afterAll(async () => {
        await User.destroy({ where: { email: testData.email } });
    });
});


// **************************************************** Endpoint Untuk test Update User (PUT) *************************************
describe('PUT /users/userId', () => {

    beforeAll(async () => {
        await User.create(testData);
        

        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: testData.email,
                password: testData.password,
        });
        
        authToken = loginResponse.body.token;
    });
    
    let authToken
    
    it('should be response 200 for success updated users',  async () => {
        
        const response = await request(app)
            .put('/users/1')
            .set('Authorization',authToken)
            .send({
                full_name: 'Updated Name',
                age: 21,
                username: 'updated username',
                phone_number: 'updated phone number'
            })

            // console.log('>> ini token',authToken)

            expect(response.statusCode).toBe(200)
            expect(response.body.user.full_name).toBe('Updated Name')
            expect(response.body.user.age).toBe(21)
            expect(response.body.user.username).toBe('updated username')
            expect(response.body.user.phone_number).toBe('updated phone number')
    })

    it('should be response 404 for error user not found', async () => {
        const response = await request(app)
            .put('/users/2')
            .set('Authorization',authToken)
            .send({
                full_name: 'Updated Name',
                age: 21,
                username: 'updated username',
                phone_number: 'updated phone number'
            })

            expect(response.statusCode).toBe(404)
            expect(response.body).toHaveProperty('error')
            expect(response.body.error).toBe('User not found.')
            expect(response.body.updatedUser).toBeUndefined()
            expect(response.body.error).toBeTruthy()
            
    })

    it('should be response 401 for error user not authenticated', async () => {
        const response = await request(app)
            .put('/users/1')
            .send({
                full_name: 'Updated Name',
                age: 25,
            });
    
        expect(response.statusCode).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
    });

    afterAll(async () => {
        await User.destroy({ where: { email: testData.email } });
    });

})


// **************************************************** Endpoint Test Untuk Delete User  *************************************
describe('DELETE /users/userId', () => {
    beforeAll(async () => {
        await User.create(testData);
        

        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: testData.email,
                password: testData.password,
        });
        
        authToken = loginResponse.body.token;
    });
    
    let authToken

    it('should be response 200 for success deleted users', async () => {
        const response = await request(app)
            .delete('/users/1')
            .set('Authorization', authToken);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Your account has been succesfully deleted')
        expect(response.body).not.toHaveProperty('id')
        expect(response.body).toHaveProperty('message')
        expect(response.body).not.toHaveProperty('error')

    })

    it('should be response 401 for error user not authenticated', async () => {
        const response = await request(app)
            .delete('/users/1')
            .send();
    
        expect(response.statusCode).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body).toEqual('token tidak disediakan')
        expect(typeof response.body).toBe('string')
        expect(response.body).not.toBe('')
    });

    it('should be response 404 for error user not found', async () => {
        const response = await request(app)
            .delete('/users/2')
            .set('Authorization',authToken)
            .send()

            expect(response.statusCode).toBe(404)
            expect(response.body).toEqual('User tidak ditemukan')
            expect(response.body).not.toHaveProperty('error')
            expect(typeof response.body).toBe('string')
            expect(response.body).not.toHaveProperty('message')
    })
})



