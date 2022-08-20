let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../index");
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
//Assertion Style
chai.should();
chai.use(chaiHttp);

describe('Users API', () => {
    /**
     * Test the GET Users route
     */
    describe("GET /user/", () => {
        it("It should GET all the Users", (done) => {
            chai.request(server)
                .get("/user/")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                    done();
                });
        });

        it("It should NOT GET all the Users", (done) => {
            chai.request(server)
                .get("/userr/")
                .end((err, response) => {
                    response.should.have.status(404);
                    done();
                });
        });

    });
    /**
     * Test the Login route
     */
    describe("POST /user/login", () => {
        it("It SHOULD login user", (done) => {
            const user = {
                email: "harisbakhabarpk@gmail.com",
                password: "Hahaha88"
            };
            chai.request(server)                
                .post("/user/login")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    response.body.should.have.property('message').eq('Correct Details')
                    done();
                });
        });

        it("It SHOULD NOT login user", (done) => {
            const user = {
                username: "harisbakhabarpk@gmail.com",
                password: "Hahaha888"
            };
            chai.request(server)                
                .post("/user/login")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(false);
                    done();
                });
        });
    });
    /**
     * Test the Signup route
     */
     describe("POST /user/", () => {
        it("It should create/signup user", (done) => {
            const user = {
                firstname: "abdullah",
                lastname: "khan",
                email:"abdullahajk@gmail.com",
                address:"House 450, St5, G-10/1, Islamabad",
                countrycode:92,
                phoneno:3365993113,
                password:"abdullah123"
            };
            chai.request(server)                
                .post("/user/")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true)
                    done();
                });
        });
        it("It SHOULD NOT create/signup user if already exists", (done) => {
            const user = {
                firstname: "haris",
                lastname: "abbasi",
                email:"harisbakhabarpk@gmail.com",
                address:"House 450, St5, G-10/1, Islamabad",
                countrycode:92,
                phoneno:3359037389,
                password:"abdullah123"
            };
            chai.request(server)                
                .post("/user/")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(409);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(false);
                    done();
                });
        });

    });
    /**
     * Test the Get User route
     */
     describe("get /user/getuser", () => {
        it("It SHOULD get user", (done) => {
            
            chai.request(server)                
                .get("/user/getuser/624e83fb04a3ad19ccf4d955")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    response.body.should.have.property('message').eq('Correct Details')
                    done();
                });
        });

        it("It SHOULD NOT get user", (done) => {
            
            chai.request(server)                
                .get("/user/getuser/624e83fb04a3ad19ccf4d958")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(false);
                    response.body.should.have.property('message').eq('User Not Found')
                    done();
                });
        });
    });
    /**
     * Test the Get User's Profile Picture route
     */
     describe("get /user/getuserpicture", () => {
        it("It SHOULD get user", (done) => {
            
            chai.request(server)                
                .get("/user/getuserpicture/624e83fb04a3ad19ccf4d955")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    response.body.should.have.property('message').eq('Correct Details')
                    done();
                });
        });

        it("It SHOULD NOT get user", (done) => {
            
            chai.request(server)                
                .get("/user/getuser/62442d963839c70b88699fa9")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(false);
                    response.body.should.have.property('message').eq('User Not Found')
                    done();
                });
        });
    });

});

