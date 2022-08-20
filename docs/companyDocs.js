    //Company APIs Started
    /**
     * @swagger
     * components:
     *   schemas:
     *     Company:
     *       type: object
     *       properties:
     *         companyName:
     *           type: string
     *           description: companyName of Company
     *         companyRegNo:
     *           type: string
     *           description: companyRegNo of Company
     *         totalvehicles:
     *           type: number
     *           description: totalvehicles of Company
     *         user:
     *           type: string
     *           descripton: companyOwner of Company 
     *         businessLicense:
     *           type: string
     *           descripton: businessLicense of Booking
     *         TaxIDnumber:
     *           type: string
     *           descripton: TaxIDnumber of Booking
     *         businessOwnersName:
     *           type: string
     *           descripton: businessOwnersName of Booking
     *         ownerGovernmentissuedID:
     *           type: string
     *           descripton: ownerGovernmentissuedID of Booking
     *       example:
     *         companyName: Flighting
     *         companyRegNo: FlLIGHT123
     *         totalvehicles: 4
     *         businessLicense: /src/1650361683447-businessLicense.PNG
     *         TaxIDnumber: /src/1650361683453-TaxIDnumber.PNG
     *         businessOwnersName: /src/1650361683454-businessOwnersName.PNG
     *         ownerGovernmentissuedID: /src/1650361683458-ownerGovernmentissuedID.PNG
     *         user: 625fce9a524a45000483eb88
     *         
     *     SinglePicture:
     *       type: object
     *       properties:
     *         image:
     *           type: string
     *           description: image of Company
     *           format: binary
     *       example:
     *         image: Flighting 
     *         
     */
    /**
     * @swagger
     * tags:
     *   name: Companys
     *   description: The Companys managing API
     */
    /**
     * @swagger
     * /company/:
     *   post:
     *     summary: Create a new Company
     *     tags: [Companys]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Company'
     *     responses:
     *       200:
     *         description: The Company was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Company'
     *       500:
     *         description: Some server error
     */
    /**
         * @swagger
         * /company/singlepicture:
         *  post:
         *    summary: Upload single picture to get url
         *    tags: [Companys]
         *    description: use to upload single picture to get url
         *    requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/SinglePicture'
         *    responses:
         *       '200':
         *         description: A successful request
         */
        