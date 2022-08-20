let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
//Assertion Style
chai.should();
chai.use(chaiHttp);
describe('Flights API', () => {
    /**
     * Test the GET flights route
     */
    describe("GET /customer/getflights", () => {
        it("It should GET all the Users", (done) => {
            const flight = {
                pickupCity:"San Diego",
                dropoffCity:"Los Angeles",
                startingDate:"2022-04-23",
                endingDate:"2022-04-24",
                departCode:"DEN",
                arrivalCode:"LAX"
            };
            chai.request(server)
                .get("/customer/getflights")
                .send(flight)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('flights').a('array');
                    done();
                });
        });

    });
    /**
     * Test the Search Airport route
     */
    describe("GET /provider/searchairport", () => {
        it("It SHOULD get searched airport", (done) => {
            const query="los ang"
            chai.request(server)                
                .get(`/provider/searchairport/${query}`)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('airports').a('array');
                    done();
                });
        });
    });
    /**
     * Test the request provider route
     */
     describe("POST /customer/requestprovider", () => {
        it("It should request provider", (done) => {
            const request = {
                flightId:"62677dc7eece75264cde2f11",
                type:"Flight",
                providerId:"6263971a34cee63170b21203",
                customerId:"6260e1f0006d6812508677c0",
                bookingId:"6257a6c367db84293c59532b"
            }
            chai.request(server)                
                .post("/customer/requestprovider")
                .send(request)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    response.body.should.have.property('request').a('object');
                    done();
                });
        });
    });
    /**
     * Test the search flight for provider route
     */
     describe("get /provider/searchflight", () => {
        it("It should search flights based on providers inputs", (done) => {
            const searchquery={
                departCode:"ISB",
                arrivalCode:"KHI",
                flightnumber:"PF126"
            }
            chai.request(server)                
                .get("/provider/searchflight")
                .send(searchquery)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('flights').a('array')
                    done();
                });
        });
    });
    /**
     * Test the search flight for provider route
     */
     describe("post /customer/postflightrequest", () => {
        it("It SHOULD post request to all providers", (done) => {
            const postrequest={
                fa_flight_id:"PIA309-1650809280-schedule-0898",
                type:"Flight",
                bookingId:"6257a6c367db84293c59532b",
                requestedBy:"6260e1f0006d6812508677c0",
                pickupIATACityCode:"ISB",
                dropoffIATACityCode:"KHI",
                pickupCity:"Islamabad",
                dropoffCity:"Karachi"
            }
            chai.request(server)                
                .post("/customer/postflightrequest")
                .send(postrequest)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    response.body.should.have.property('postrequest').a('object')
                    done();
                });
        });
    });
    /**
     * Test the Static Info By fa_flight_id route
     */
     describe("get /customer/staticinfobyfaflightid", () => {
        it("It should search flights based on providers inputs", (done) => {
            const faflightid="PIA301-1652331960-schedule-0600"
            chai.request(server)                
                .get(`/customer/staticinfobyfaflightid/${faflightid}`)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('flights').a('array')
                    done();
                });
        });
    });
    
    

});