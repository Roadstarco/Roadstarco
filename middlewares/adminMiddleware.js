var jwt = require('jsonwebtoken');
const verifyToken=(req,res,next)=>{
    const token=req.headers["x-access-token"]
    if(!token){
      res.send("Yo, we need a token")
    }else{
      jwt.verify(token,process.env.JWT_SECRET, (err,decoded)=>{
        if(err){
                console.log("you failed authenticate")
                res.json({auth:false, message:"you failed authenticate" })
        }else{
          req.adminId=decoded.id;
          console.log("you authenticated",decoded.id)
          next()
        }
      })
    }
  }
  module.exports = { 
    verifyToken
}