    //Customer APIs Started
    /**
     * @swagger
     * components:
     *   schemas:
     *     GetFlights:
     *       type: object
     *       properties:
     *         pickupCity:
     *           type: object
     *           description: pickupCity for flight
     *         dropoffCity:
     *           type: object
     *           description: dropoffCity for flight
     *         startingDate:
     *           type: object
     *           description: startingDate for flight
     *         endingDate:
     *           type: object
     *           description: endingDate for flight
     *         departCode:
     *           type: object
     *           description: departCode for flight
     *         arrivalCode:
     *           type: object
     *           description: arrivalCode for flight
     *       example:
     *         pickupCity: Islamabad
     *         dropoffCity: Karachi
     *         startingDate: 2022-05-16
     *         endingDate: 2022-06-05
     *         departCode: ISB
     *         arrivalCode: KHI
     *     RequestProvider:
     *       type: object
     *       properties:
     *         shipId:
     *           type: string
     *           description: shipId 
     *         flightId:
     *           type: string
     *           description: flightId
     *         type:
     *           type: string
     *           description: type of request
     *         providerId:
     *           type: string
     *           description: providerId for request
     *         customerId:
     *           type: string
     *           description: customerId for request
     *         bookingId:
     *           type: string
     *           description: bookingId for request
     *       example:
     *         shipId: 626a3cfeb3fdc51078fca468
     *         flightId: null
     *         type: Ship
     *         providerId: 6263971a34cee63170b21203
     *         customerId: 6260e1f0006d6812508677c0
     *         bookingId: 6257a6c367db84293c59532b
     *     GetShips:
     *       type: object
     *       properties:
     *         pickupCity:
     *           type: string
     *           description: pickupCity 
     *         dropoffCity:
     *           type: string
     *           description: dropoffCity
     *         startingDate:
     *           type: date
     *           description: startingDate
     *         endingDate:
     *           type: date
     *           description: endingDate
     *         pickupPortUnlocode:
     *           type: string
     *           description: customerId for request
     *         dropoffPortUnlocode:
     *           type: string
     *           description: bookingId for request
     *       example:
     *         pickupCity: Kuwait
     *         dropoffCity: Abu Dhabi
     *         startingDate: 2022-05-08
     *         endingDate: 2022-05-14
     *         pickupPortUnlocode: KWKWI
     *         dropoffPortUnlocode: AEKHL  
     *        
     *     CalculateDistance:
     *       type: object
     *       properties:
     *         pickupAddress:
     *           type: string
     *           description: pickupAddress for calculate distance 
     *         dropAddress:
     *           type: string
     *           description: dropoffCity for calculate distance
     *       example:
     *         pickupAddress: {
     *            "lat":33.7182,
     *            "lng":73.0714
     *         }
     *         dropAddress: {
     *            "lat":33.6617,
     *            "lng":73.0568
     *         }  
     *     
     *     PostFlightRequest:
     *       type: object
     *       properties:
     *         fa_flight_id:
     *           type: string
     *           description: fa_flight_id of flight 
     *         mmsiNumber:
     *           type: string
     *           description: mmsiNumber of ship
     *         type:
     *           type: date
     *           description: type of post request
     *         bookingId:
     *           type: date
     *           description: bookingId of booking
     *         requestedBy:
     *           type: string
     *           description: requestedBy of user
     *         pickupIATACityCode:
     *           type: string
     *           description: pickupIATACityCode of requested flight
     *         dropoffIATACityCode:
     *           type: string
     *           description: dropoffIATACityCode of requested flight
     *         pickupCity:
     *           type: string
     *           description: pickupCity of requested flight
     *         dropoffCity:
     *           type: string
     *           description: dropoffCity of requested flight
     *       example:
     *         fa_flight_id: SIF122-1654060260-schedule-0689
     *         mmsiNumber: null
     *         type: Flight
     *         bookingId: 6257a6c367db84293c59532b
     *         requestedBy: 6260e1f0006d6812508677c0
     *         pickupIATACityCode: ISB   
     *         dropoffIATACityCode: KHI
     *         pickupCity: Islamabad
     *         dropoffCity: Karachi       
     */
    /**
     * @swagger
     * tags:
     *   name: Customers
     *   description: The Customers managing API
     */
    /**
     * @swagger
     * /customer/searchcity/Islamabad:
     *   get:
     *     summary: To Search City
     *     tags: [Customers]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *     responses:
     *       200:
     *         description: City has been Searched
     *         content:
     *           application/json:
     *       500:
     *         description: Some server error
     */
    /**
     * @swagger
     * /customer/getflights:
     *  post:
     *    summary: To get flights based on search information
     *    tags: [Customers]
     *    description: use to get flights based on search information
     *    requestBody:
     *        required: true
     *        content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GetFlights'
     *    responses:
     *       '200':
     *         description: A successful request
     */
        /**
         * @swagger
         * /customer/requestprovider:
         *  post:
         *    summary: To request provider flight
         *    tags: [Customers]
         *    description: use to request provider flight
         *    requestBody:
         *        required: true
         *        content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/RequestProvider'
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /customer/postflightrequest:
         *  post:
         *    summary: To post requesting provider to book any flight
         *    tags: [Customers]
         *    description: use to post requesting provider to book any flight
         *    requestBody:
         *        required: true
         *        content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/PostFlightRequest'
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /customer/staticinfobyfaflightid/PIA301-1652331960-schedule-0600:
         *  get:
         *    summary: To get static information for a flight
         *    tags: [Customers]
         *    description: use to get static information for a flight
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /customer/getships:
         *  post:
         *    summary: To get ships for customer
         *    tags: [Customers]
         *    description: use to get ships for customer
         *    requestBody:
         *        required: true
         *        content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/GetShips'
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /customer/createdriverrequest:
         *  post:
         *    summary: To make request to driver
         *    tags: [Customers]
         *    description: use to make request to driver
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /customer/updatedriverrequest/:id:
         *  post:
         *    summary: To update request to driver
         *    tags: [Customers]
         *    description: use to update request to driver
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /customer/updatedriverrequest/:id:
         *  post:
         *    summary: To update request to driver
         *    tags: [Customers]
         *    description: use to update request to driver
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /customer/calculatedistance:
         *  post:
         *    summary: To calculate distance
         *    tags: [Customers]
         *    description: use to calculate distance
         *    requestBody:
         *        required: true
         *        content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CalculateDistance'
         *    responses:
         *       '200':
         *         description: A successful request
         */