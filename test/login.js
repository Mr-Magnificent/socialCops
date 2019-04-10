process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const fs = require('fs');
const should = chai.should();

// const {login, create, logout} = require('../app/controllers/loginController');

chai.use(chaiHttp);

describe('LoginController', () => {
    describe('create()', () => {

        before(() => {
            fs.writeFile(__dirname + '/../testDatabase.txt', JSON.stringify({}), (err) => {
                if (err)
                    throw err;
            })
        })

        it('should create a user', (done) => {
            const body = {
                "email": "ayush.zombiestar@gmail.com",
                "password": "12345"
            }
            chai.request(server)
                .put('/api/create')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a('object');
                    res.body.should.have.property('message');
                    done();
                })
        })

        it('should reject create user', (done) => {
            const body = {
                "email": "ayush.zombiestar@gmail.com",
                "password": "12345"
            }
            chai.request(server)
                .put('/api/create')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.should.be.a('object');
                    res.body.should.have.property('message');
                    done();
                })
        })
    })

    describe('login()', () => {
        it('should reject login', (done) => {
            const body = {
                "email": "wrong@gmail.com",
                "password": "12345"
            }
            chai.request(server)
                .post('/api/login')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.should.be.a('object');
                    res.body.should.have.property('message').eql('Email not registered');
                    done();
                })
        })

        it('should reject login', (done) => {
            const body = {
                "email": "ayush.zombiestar@gmail.com",
                "password": "1234"
            }
            chai.request(server)
                .post('/api/login')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.should.be.a('object');
                    res.body.should.have.property('message').eql('password does not match!');
                    done();
                })
        })

        it('should reject login', (done) => {
            const body = {
                "password": "1234"
            }
            chai.request(server)
                .post('/api/login')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.should.be.a('object');
                    res.body.should.have.property('message').eql('Email not registered');
                    done();
                })
        })

        it('should login', (done) => {
            const body = {
                "email": "ayush.zombiestar@gmail.com",
                "password": "12345"
            }
            chai.request(server)
                .post('/api/login')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    })
})

describe('/patch', () => {
    describe('Patch()', () => {
        it('should be protected', async () => {
            const body2 = {
                "json": JSON.stringify({
                    "baz": "qux",
                    "foo": "bar"
                }),
                "patch": JSON.stringify([{
                    "op": "replace",
                    "path": "/baz",
                    "value": "boo"
                }])
            }
            const resPatch = await chai.request(server)
                .post('/api/patch')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body2);

            resPatch.should.have.status(403);

        })
        it('should patch', async () => {
            const body = {
                "email": "ayush.zombiestar@gmail.com",
                "password": "12345"
            }
            let agent = chai.request.agent(server);
            const res = await agent
                .post('/api/login')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body);
            res.should.have.status(200);
            res.should.have.cookie('jwt');

            const body2 = {
                "json": JSON.stringify({
                    "baz": "qux",
                    "foo": "bar"
                }),
                "patch": JSON.stringify([{
                    "op": "replace",
                    "path": "/baz",
                    "value": "boo"
                }])
            }

            const resPatch = await agent
                .post('/api/patch')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body2);

            resPatch.body.should.eql({
                baz: 'boo',
                foo: 'bar'
            })
            resPatch.should.have.status(200);

        })

        it('should not patch', async () => {
            const body = {
                "email": "ayush.zombiestar@gmail.com",
                "password": "12345"
            }
            let agent = chai.request.agent(server);
            const res = await agent
                .post('/api/login')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body);
            res.should.have.status(200);
            res.should.have.cookie('jwt');

            const body3 = {
                "json": JSON.stringify({
                    "foo": "bar"
                }),
                "patch": JSON.stringify([{
                    "op": "replace",
                    "path": "/baz",
                    "value": "boo"
                }])
            }

            const badPatch = await agent
                .post('/api/patch')
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send(body3);

            badPatch.should.have.status(400);
            badPatch.body.should.have.property('message').eql("Patch was invalid!");
        })
    })
})

describe('/image', () => {
    it('should be protected', async () => {        
        const resImage = await chai.request(server)
            .get('/api/image?url=https://www.google.co.in/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png');

        resImage.should.have.status(403);
    })
    it('should return thumbnail', async () => {
        const body = {
            "email": "ayush.zombiestar@gmail.com",
            "password": "12345"
        }
        let agent = chai.request.agent(server);
        const res = await agent
            .post('/api/login')
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send(body);
        res.should.have.status(200);
        res.should.have.cookie('jwt');

        const resImage = await agent
            .get('/api/image?url=https://www.google.co.in/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png');
    })
    it('should not return thumbnail', async () => {
        const body = {
            "email": "ayush.zombiestar@gmail.com",
            "password": "12345"
        }
        let agent = chai.request.agent(server);
        const res = await agent
            .post('/api/login')
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send(body);
        res.should.have.status(200);
        res.should.have.cookie('jwt');

        const resImage = await agent
            .get('/api/image?url=/api/image?url=https://www.google.co.in/elogo_color_92x30dp.png');
        resImage.should.have.status(500);
    })

    it('should have valid url', async () => {
        const body = {
            "email": "ayush.zombiestar@gmail.com",
            "password": "12345"
        }
        let agent = chai.request.agent(server);
        const res = await agent
            .post('/api/login')
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send(body);
        res.should.have.status(200);
        res.should.have.cookie('jwt');

        const resImage = await agent
            .get('/api/image?url=/api/image?url=sfjlkajgsfkjh');
        // console.log(resImage);
        resImage.should.have.status(400);
    })

    it('should have valid mimetype', async () => {
        const body = {
            "email": "ayush.zombiestar@gmail.com",
            "password": "12345"
        }
        let agent = chai.request.agent(server);
        const res = await agent
            .post('/api/login')
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send(body);
        res.should.have.status(200);
        res.should.have.cookie('jwt');

        const resImage = await agent
            .get('/api/image?url=/api/image?url=https://www.google.co.in/30dp.nmm');
        // console.log(resImage);
        resImage.should.have.status(400);
    })
})

describe('/logout', () => {
    it('should logout', async () => {
        const body = {
            "email": "ayush.zombiestar@gmail.com",
            "password": "12345"
        }

        let agent = chai.request.agent(server);
        const res = await agent
            .post('/api/login')
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send(body);
        res.should.have.status(200);
        res.should.have.cookie('jwt');

        const resLogout = await agent
            .get('/api/logout');
        resLogout.should.has.status(200);
    })
    it('should login again', async () => {
        const body = {
            "email": "ayush.zombiestar@gmail.com",
            "password": "12345"
        }

        let agent = chai.request.agent(server);
        const res = await agent
            .post('/api/login')
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send(body);
        res.should.have.status(200);
        res.should.have.cookie('jwt');
    })
})

describe('/delete', () => {
    it('should delete user', async () => {
        const body = {
            "email": "ayush.zombiestar@gmail.com",
            "password": "12345"
        }

        let agent = chai.request.agent(server);
        const res = await agent
            .post('/api/login')
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send(body);
        res.should.have.status(200);
        res.should.have.cookie('jwt');

        const resLogout = await agent
            .get('/api/delete');
        resLogout.should.has.status(200);
    })
    it('should not login now', async () => {
        const body = {
            "email": "ayush.zombiestar@gmail.com",
            "password": "12345"
        }

        let agent = chai.request.agent(server);
        const res = await agent
            .post('/api/login')
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send(body);
        res.should.have.status(400);
    })
})
