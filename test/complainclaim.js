let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
//Assertion Style
chai.should();
chai.use(chaiHttp);
describe('Complain Claim API', () => {
    
    /**
     * Test the creating complain route
     */
     describe("POST /complainclaim/", () => {
        it("It should create complain", (done) => {
            const complain = {
                complainTitle: "Gal Wadd Gai Hai",
                dropAddress: "Complain description it is",
                complainBy: "6263971a34cee63170b21203"
            }
            chai.request(server)                
                .post("/complainclaim/")
                .send(complain)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    response.body.should.have.property('complain');
                    done();
                });
        });
    });
    /**
     * Test the Get Complains By User route
     */
     describe("get /complainclaim/getcomplainsbyuser/", () => {
        it("It should Get Complains By User", (done) => {
            const userid="6263971a34cee63170b21203"
            chai.request(server)
                .get(`/complainclaim/getcomplainsbyuser/${userid}`)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('requests').a('array')
                    done();
                });
        });
    });
    /**
     * Test the Delete Complain route
     */
     describe("delete /complainclaim/deletecomplain/", () => {
        it("It should Delete Complain by Id", (done) => {
            const complainid="6284c88d463cc4296c9b3063"
            chai.request(server)
                .delete(`/complainclaim/deletecomplain/${complainid}`)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('complain');
                    done();
                });
        });
    });
    
    
    

});