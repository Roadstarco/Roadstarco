let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
//Assertion Style
chai.should();
chai.use(chaiHttp);
describe('Customer API', () => {
    
    /**
     * Test the calculating distance route
     */
     describe("POST /customer/calculatedistance", () => {
        it("It should calculate distance", (done) => {
            const location = {
                "pickupAddress": {
                    "lat":33.7182,
                    "lng":73.0714
                },
                "dropAddress": {
                    "lat":33.6617,
                    "lng":73.0568
                }
            }
            chai.request(server)                
                .post("/customer/calculatedistance")
                .send(location)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    response.body.should.have.property('distanceInKM');
                    done();
                });
        });
    });
    
    
    

});