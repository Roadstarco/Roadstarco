var claimModel = require('../models/claimModel')
const bcrypt = require("bcrypt")
var ObjectId = require('mongodb').ObjectID;
const { claimSchema } = require('../helpers/claimValidationSchema')
const createClaim = async(req,res)=>{ 
  try {
    console.log("req.body ", req.body);
    const result = await claimSchema.validateAsync(req.body)
    //saving user to DB
    const newclaim = await new claimModel({
        claimTitle: req.body.claimTitle,
        claimDescription: req.body.claimDescription,
        claimBy:req.body.claimBy
    }).save();
    //sending success if claim gets created
    if(newclaim){
      console.log("Claim has been created",newclaim)
      res.status(200).send({
        success: true,
        message:"Claim has been created",
        claim:newclaim
      });
    }else{
      console.log("Claim Request Failed")
      //sending failure if claim doesn't get created
      res.status(404).send({
        success: false,
        message:"Claim Request Failed"
      });
    }
  }
  catch(err) {
    console.log("err.isJoi: ",err)
    if(err.isJoi){
      res.status(422).json({
        success:false,
        message:err.details[0].message
      })
    }
  } 
}
const getClaimsByUser = async(req,res)=>{ 
    try {
      //Find all the claims registered by single user
      console.log(req.params.userid,)
      var claims=await claimModel.find({ claimBy: req.params.userid }).populate('claimBy').sort({date:-1})
      if(claims.length>0){
        //Sending success if claims get found
        res.status(200).send({
          success:true,
          message:"Claims By User Found",
          claims:claims
        });
      }else{
        //Sending success if claims don't get found
        res.status(404).send({
          success:false,
          message:"Claims Not Found"
        });
      }
    }
    catch(err) {
      console.log("err.isJoi: ",err)
      if(err.isJoi){
        res.status(422).json({
          success:false,
          message:err.details[0].message
        })
      }else{
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
          })
      }
    }
  }
  const deleteClaim=async(req,res)=>{
    try {
      console.log("claimID: ",req.params.claimid)
      //soft deleting user by ID 
      const claim=await claimModel.deleteOne({"_id": ObjectId(req.params.claimid)});
      if(claim){
        //Sending success if Claim deleted successfully
        return res.status(200).send({
          success: true,
          message: 'Claim Deleted',
          claim: claim
        });
      }else{
        //Sending failure if Claim don't exists by given ID and cant be deleted
        return res.status(404).send({
          success: false,
          message: 'No Claim By Given ID'
        });
      }
    }
    catch(err) {
      console.log("err",err)
      return res.status(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    } 
    
}
module.exports = {
  createClaim,
  getClaimsByUser,
  deleteClaim
};