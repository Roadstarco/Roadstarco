    //Booking APIs Started
    /**
     * @swagger
     * components:
     *   schemas:
     *     Booking:
     *       type: object
     *       properties:
     *         vehicleType:
     *           type: string
     *           description: vehicleType of Booking
     *         category:
     *           type: string
     *           description: Last Name of Booking
     *         productType:
     *           type: string
     *           description: Email of Booking
     *         productWeight:
     *           type: string
     *           descripton: Address of Booking 
     *         productDistribution:
     *           type: integer
     *           descripton: productDistribution of Booking
     *         instructions:
     *           type: integer
     *           descripton: instructions of Booking
     *         recieverName:
     *           type: string
     *           descripton: recieverName of Booking
     *         recieverPhoneno:
     *           type: string
     *           descripton: recieverPhoneno of Booking
     *         bookedBy:
     *           type: string
     *           descripton: User ID of User who booked 
     *       example:
     *         firstname: abdullah
     *         lastname: khan
     *         email: abdullahajk@gmail.com
     *         address: G-10/1, St5, G-10/1, Islamabad
     *         countrycode: 92
     *         phoneno: 3365993113
     *         password: abdullah123
     *     updateBooking:
     *       type: object
     *       properties:
     *         vehicleType:
     *           type: string
     *           description: vehicleType of Booking
     *         category:
     *           type: string
     *           description: Last Name of Booking
     *         productType:
     *           type: string
     *           description: Email of Booking
     *         productWeight:
     *           type: string
     *           descripton: Address of Booking 
     *         productDistribution:
     *           type: integer
     *           descripton: productDistribution of Booking
     *         instructions:
     *           type: integer
     *           descripton: instructions of Booking
     *         recieverName:
     *           type: string
     *           descripton: recieverName of Booking
     *         recieverPhoneno:
     *           type: string
     *           descripton: recieverPhoneno of Booking
     *         bookedBy:
     *           type: string
     *           descripton: User ID of User who booked 
     *       example:
     *         instructions: Meet me there dumbass2
     *
     */
    /**
     * @swagger
     * tags:
     *   name: Bookings
     *   description: The Bookings managing API
     */
    /**
     * @swagger
     * /booking/:
     *   post:
     *     summary: Create a new booking
     *     tags: [Bookings]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Booking'
     *     responses:
     *       200:
     *         description: The Booking was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Booking'
     *       500:
     *         description: Some server error
     */
    /**
         * @swagger
         * /booking/getbooking/6255194d73d9e72504ac2d71:
         *  get:
         *    summary: Get SIngle Booking By ID
         *    tags: [Bookings]
         *    description: use to single booking by ID
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /booking/deletebooking/6255194d73d9e72504ac2d71:
         *  delete:
         *    summary: Delete Single Booking By ID
         *    tags: [Bookings]
         *    description: use to delete single booking by ID
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /booking/getallbookings:
         *  get:
         *    summary: Get All Bookings
         *    tags: [Bookings]
         *    description: use to get all bookings
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
     * @swagger
     * /booking/updatebooking/6258f6c0ee758e21dc8a2fc5:
     *   patch:
     *     summary: Update a new booking
     *     tags: [Bookings]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/updateBooking'
     *     responses:
     *       200:
     *         description: The Booking was successfully created
     *       500:
     *         description: Some server error
     */