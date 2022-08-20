var complainModel = require('../models/complainModel')
const bcrypt = require("bcrypt")
var ObjectId = require('mongodb').ObjectID;
const { complainSchema } = require('../helpers/complainValidationSchema')
const createComplain = async(req,res)=>{ 
  try {
    console.log("req.body is", req.body);
    const result = await complainSchema.validateAsync(req.body)
    //saving user to DB
    const newcomplain = await new complainModel({
        complainTitle: req.body.complainTitle,
        complainDescription: req.body.complainDescription,
        complainImage:req.files?req.files['complainImage']?"/src/"+req.files['complainImage'][0].filename:null:null,
        complainBy:req.body.complainBy
    }).save();
    //sending success if complain gets created
    if(newcomplain){
      console.log("Complain has been created",newcomplain)
      res.status(200).send({
        success: true,
        message:"Complain has been created",
        complain:newcomplain
      });
    }else{
      console.log("Request Failed")
      //sending failure if complain doesn't get created
      res.status(404).send({
        success: false,
        message:"Request Failed"
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
const getComplainsByUser = async(req,res)=>{ 
    try {
      //Find all the complains registered by single user
      console.log(req.params.userid)
      const complains=await complainModel.find({ complainBy: req.params.userid }).populate('complainBy').sort({date:-1})
      if(complains.length>0){
        //Sending success if requests get found
        res.status(200).send({
          success:true,
          message:"Complains By User Found",
          complains:complains
        });
      }else{
        //Sending success if requests don't get found
        res.status(404).send({
          success:false,
          message:"Complains Not Found"
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
        res.status(422).json({
            success:false,
            message:"Internal Server Error"
          })
      }
    }
  }
  const deleteComplain=async(req,res)=>{
    try {
      console.log("complainID: ",req.params.complainid)
      //soft deleting user by ID 
      const complain=await complainModel.deleteOne({"_id": ObjectId(req.params.complainid)});
      if(complain){
        //Sending success if complain deleted successfully
        return res.status(200).send({
          success: true,
          message: 'Complain Deleted',
          complain: complain
        });
      }else{
        //Sending failure if Complain don't exists by given ID and cant be deleted
        return res.status(404).send({
          success: false,
          message: 'No Complain By Given ID'
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
  const getAllComplains = async(req,res)=>{ 
    try {
      //Find all the complains
      const complains=await complainModel.find({}).populate('complainBy').sort({date:-1})
      if(complains.length>0){
        //Sending success if complains get found
        res.status(200).send({
          success:true,
          message:"All Complains Found",
          complains:complains
        });
      }else{
        //Sending success if complains don't get found
        res.status(404).send({
          success:false,
          message:"No Complains Found"
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
  
module.exports = {
  createComplain,
  getComplainsByUser,
  deleteComplain,
  getAllComplains
};