let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
//Assertion Style
chai.should();
chai.use(chaiHttp);
describe('Driver APIs', () => {
    
    /**
     * Test the adding vehicle route
     */
     describe("POST /driver/addingvehicle", () => {
        it("It should add vehicle", (done) => {
            const vehicle = {
                category:"Car",
                model:"2017",
                engineNumber:"17777A77G",
                vehicleCode:"V002",
                licencePlate:"2008-H-6",
                dateOfRegistration:"1979-07-11",
                vehicleImage:"/src/1652187508516-honda civic mandua.jpg",
                vehicleLicence:"/src/1652187508516-honda civic mandua.jpg",
                vehicleInsurance:"/src/1652187508516-honda civic mandua.jpg",
                vehicleResidenceProof:"/src/1652187508516-honda civic mandua.jpg",
                driverId:"625510f2d8e3e400045de1bf"
            }
            chai.request(server)                
                .post("/driver/addingvehicle")
                .send(vehicle)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('success').eq(true);
                    done();
                });
        });
    });
    
    
    

});