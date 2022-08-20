    //Driver APIs Started
    /**
     * @swagger
     * components:
     *   schemas:
     *     Driver:
     *       type: object
     *       properties:
     *         vehicleType:
     *           type: string
     *           description: vehicleType of Booking
     *         vehiclename:
     *           type: string
     *           description: vehiclename of Booking
     *         vehiclecolor:
     *           type: string
     *           description: vehiclecolor of Booking
     *         vehicleimage:
     *           type: string
     *           descripton: vehicleimage of Booking 
     *         vehiclelicence:
     *           type: integer
     *           descripton: vehiclelicence of Booking
     *         vehicleLicenceRegno:
     *           type: integer
     *           descripton: vehicleLicenceRegno of Booking
     *         vehicleInsurance:
     *           type: string
     *           descripton: vehicleInsurance of Booking
     *         vehicleResidenceProof:
     *           type: string
     *           descripton: vehicleResidenceProof of Booking
     *         user:
     *           type: string
     *           descripton: User ID of User 
     *       example:
     *         vehicletype: Four Wheeler E
     *         vehiclename: Alto 80090
     *         vehiclecolor: Black
     *         user: 62554fe8d2206f00040f82cc
     *         countrycode: 92
     *         phoneno: 3365993113
     *         password: abdullah123
     *     Getdriverrequests:
     *       type: object
     *       properties:
     *         driverLocation:
     *           type: object
     *           description: driverLocation of Driver
     *       example:
     *         driverLocation: {
     *           "lat":33.7008114,
     *           "lng":73.0634073
     *         }
     *     Addvehicle:
     *       type: object
     *       properties:
     *         category:
     *           type: string
     *           description: category of Vehicle
     *         model:
     *           type: number
     *           description: model of Vehicle
     *         engineNumber:
     *           type: string
     *           description: engineNumber of Vehicle
     *         vehicleCode:
     *           type: string
     *           description: vehicleCode of Vehicle
     *         licencePlate:
     *           type: string
     *           description: licencePlate of Vehicle
     *         dateOfRegistration:
     *           type: string
     *           description: dateOfRegistration of Vehicle
     *         vehicleLicence:
     *           type: string
     *           description: vehicleLicence of Vehicle
     *         vehicleInsurance:
     *           type: string
     *           description: vehicleInsurance of Vehicle
     *         vehicleResidenceProof:
     *           type: string
     *           description: vehicleResidenceProof of Vehicle
     *         driverId:
     *           type: string
     *           description: vehicleResidenceProof of Vehicle
     *       example:
     *         category: Car
     *         model: 2017
     *         engineNumber: 17777A77G
     *         vehicleCode: V002
     *         licencePlate: 2008-H-6
     *         dateOfRegistration: 1979-07-11
     *         vehicleImage: /src/1652187508516-honda civic mandua.jpg
     *         vehicleLicence: /src/1652187508516-honda civic mandua.jpg
     *         vehicleInsurance: /src/1652187508516-honda civic mandua.jpg
     *         vehicleResidenceProof: /src/1652187508516-honda civic mandua.jpg
     *         driverId: 625510f2d8e3e400045de1bf 
     *
     */
    /**
     * @swagger
     * tags:
     *   name: Drivers
     *   description: The Drivers managing API
     */
    /**
     * @swagger
     * /driver/:
     *   post:
     *     summary: Create a new driver
     *     tags: [Drivers]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Driver'
     *     responses:
     *       200:
     *         description: The Driver was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Driver'
     *       500:
     *         description: Some server error
     */
    /**
         * @swagger
         * /driver/getdriver/625cef9d2afe1827a8202d92:
         *  get:
         *    summary: Get Single Driver By ID
         *    tags: [Drivers]
         *    description: use to single driver by ID
         *    responses:
         *       '200':
         *         description: A successful request
         */
         /**
     * @swagger
     * /driver/addingvehicle:
     *   post:
     *     summary: To adding vehicle
     *     tags: [Drivers]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Addvehicle'
     *     responses:
     *       200:
     *         description: The vehicle was successfully added
     *       500:
     *         description: Some server error
     */
     /**
         * @swagger
         * /driver/getallvehicles/625510f2d8e3e400045de1bb:
         *  get:
         *    summary: Get Getting All Vehicles
         *    tags: [Drivers]
         *    description: use to get all vehicles
         *    responses:
         *       '200':
         *         description: A successful request
         */   
         /**
     * @swagger
     * /driver/getdriverrequests:
     *   post:
     *     summary: To get driver requests
     *     tags: [Drivers]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *              $ref: '#/components/schemas/Getdriverrequests'
     *     responses:
     *       200:
     *         description: The driverrequest was successfully created
     *       500:
     *         description: Some server error
     */