let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
//Assertion Style
chai.should();
chai.use(chaiHttp);
describe('Ships API', () => {
    /**
     * Test the GET ships route
     */
    describe("POST /customer/getships", () => {
        it("It should GET all the ships based on entered query", (done) => {
            const ship = {
                pickupCity:"Pipavav",
                dropoffCity:"Karachi",
                startingDate:"2022-04-28",
                endingDate:"2022-05-01",
                pickupPortUnlocode:"INPAV",
                dropoffPortUnlocode:"PKKHI"
            };
            chai.request(server)
                .post("/customer/getships")
                .send(ship)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    response.body.should.have.property('ships').a('array');
                    done();
                });
        });

    });
    /**
     * Test the Search port route
     */
     describe("GET /provider/searchport", () => {
        it("It SHOULD get searched airport", (done) => {
            const query="Pipavav"
            chai.request(server)                
                .get(`/provider/searchport/${query}`)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('ports').a('array');
                    done();
                });
        });
    });
    /**
     * Test the Get Requests To Provider Ship route
     */
     describe("GET /provider/getrequeststoprovidership/626a3cfeb3fdc51078fca468", () => {
        it("It SHOULD get searched airport", (done) => {
            const id="626a3cfeb3fdc51078fca468"
            chai.request(server)                
                .get(`/provider/getrequeststoprovidership/${id}`)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('requests').a('array');
                    done();
                });
        });
    });
    /**
     * Test the Add Ship API
     */
     describe("GET /provider/addship", () => {
        it("It SHOULD get searched airport", (done) => {
            const ship = {
                providerId:"6263971a34cee63170b21203",
                pickupCity:"Yokohama",
                dropoffCity:"Karachi",
                shipDate:"2022-04-18",
                departurePort:"Yokohama",
                destinationPort:"Muhammad Bin Qasim",
                departureTime:"11:39",
                destinationTime:"13:00",
                ticketImage:"",
                mmsi:567001420,
                pickupPortUnlocode:"JPYOK",
                dropoffPortUnlocode:"PKBQM"
            };
            chai.request(server)                
                .post(`/provider/addship`)
                .send(ship)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('requests').a('array');
                    done();
                });
        });
    });
    
    
    
    

});