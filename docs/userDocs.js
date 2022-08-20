    //User APIs Started
    /**
     * @swagger
     * components:
     *   schemas:
     *     User:
     *       type: object
     *       required:
     *         - userId
     *         - title
     *         - body
     *       properties:
     *         firstname:
     *           type: string
     *           description: First Name of User
     *         lastname:
     *           type: string
     *           description: Last Name of User
     *         email:
     *           type: string
     *           description: Email of User
     *         address:
     *           type: string
     *           descripton: Address of User 
     *         countrycode:
     *           type: integer
     *           descripton: CountryCode of User's Number
     *         phoneno:
     *           type: integer
     *           descripton: Phoneno of User's Number
     *         profilepic:
     *           type: string
     *           descripton: Profile Pic of User
     *         password:
     *           type: string
     *           descripton: Password of User
     * 
     *       example:
     *         firstname: abdullah
     *         lastname: khan
     *         email: abdullahajk@gmail.com
     *         address: G-10/1, St5, G-10/1, Islamabad
     *         countrycode: 92
     *         phoneno: 3365993113
     *         password: abdullah123
     *     Login:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *           description: email of User
     *         password:
     *           type: string
     *           description: password of User
     * 
     *       example:
     *         email: harisbakhabarpk@gmail.com
     *         password: Hahaha88
     *     Confirmotp:
     *       type: object
     *       properties:
     *         otp:
     *           type: string
     *           description: otp of User
     * 
     *       example:
     *         otp: 7jdh7k
     *     Forgetpassword:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *           description: email of User
     * 
     *       example:
     *         email: harisbakhabarpk@gmail.com
     *     Verifyotp:
     *       type: object
     *       properties:
     *         resetPasswordOtp:
     *           type: string
     *           description: resetPasswordOtp of User
     * 
     *       example:
     *         resetPasswordOtp: 47q8u0
     * 
     *     Resetpassword:
     *       type: object
     *       properties:
     *         password:
     *           type: string
     *           description: password of User
     *         confirmpassword:
     *           type: string
     *           description: confirmpassword of User
     *         userid:
     *           type: string
     *           description: userid of User
     * 
     *       example:
     *         password: Hahaha88
     *         confirmpassword: Hahaha88
     *         userid: 624e901a8a98c504404b90f6
     */
    /**
     * @swagger
     * tags:
     *   name: Users
     *   description: The Users managing API
     */
    /**
     * @swagger
     * /user/:
     *   post:
     *     summary: Create a new user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       200:
     *         description: The user was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       500:
     *         description: Some server error
     */
        /**
         * @swagger
         * /user/:
         *  get:
         *    summary: Get All Users
         *    tags: [Users]
         *    description: use to get all users
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
     * @swagger
     * /user/login:
     *   post:
     *     summary: To Login In User
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Login'
     *     responses:
     *       200:
     *         description: The user was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Login'
     *       500:
     *         description: Some server error
     */
    /**
     * @swagger
     * /user/confirmotp:
     *   post:
     *     summary: To Enter Login OTP
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Confirmotp'
     *     responses:
     *       200:
     *         description: OTP Successful, User Is Logged-In
     *       500:
     *         description: Some server error
     */
    /**
     * @swagger
     * /user/logout:
     *  get:
     *    summary: To Logout User
     *    tags: [Users]
     *    description: use to logout user
     *    responses:
     *       '200':
     *         description: A successful request
     */
    /**
     * @swagger
     * /user/forgetpassword2:
     *   post:
     *     summary: To Get OTP For Forget Password
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Forgetpassword'
     *     responses:
     *       200:
     *         description: Reset Password OTP sent
     *       500:
     *         description: Some server error
     */
    /**
     * @swagger
     * /user/verifyotp:
     *   post:
     *     summary: To Verify OTP For Reset Password
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Verifyotp'
     *     responses:
     *       200:
     *         description: OTP Verified. User Can Change The Password
     *       500:
     *         description: Some server error
     */
        /**
         * @swagger
         * /user/resetpassword:
         *   post:
         *     summary: To Reset User Password 
         *     tags: [Users]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/Resetpassword'
            *     responses:
        *       200:
        *         description: Password Updated
        *       500:
        *         description: Some server error
        */ 
       /**
         * @swagger
         * /user/getuser/624c07d181438c2be431af6f:
         *  get:
         *    summary: Get Certain User
         *    tags: [Users]
         *    description: use to get certain user
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /user/deleteuser/624c07d181438c2be431af6f:
         *  get:
         *    summary: Delete Certain User
         *    tags: [Users]
         *    description: use to delete certain user
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /user/getuserpicture/624c07d181438c2be431af6f:
         *  get:
         *    summary: Get Certain User Profile Picture
         *    tags: [Users]
         *    description: use to get certain user's profile picture
         *    responses:
         *       '200':
         *         description: A successful request
         */
        /**
         * @swagger
         * /user/updateuser/624c07d181438c2be431af6f:
         *   patch:
         *     summary: To Update User Information 
         *     tags: [Users]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/User'
            *     responses:
        *       200:
        *         description: User Updated!
        *       500:
        *         description: Some server error
        */ 
    
        