const users = require('../model/users')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


var checkUserAuth = async(req,res,next)=>{
    try{
        let token
        const {authorization} = req.headers
        if (authorization && authorization.startsWith('Bearer')) {
            token =  authorization.split(" ")[1]
            const decodedToken = jwt.verify(token,"04fc038d1d3bd41e0ae5ad130a5688c4")
            const id = decodedToken.id
            req.user = await users.findById(id).select("-password")         
            next();
        }
        else{
            res.status(200).json({
            success: false,
            message: "Un Authorized User"
            })
        }
    }
    catch(error){
        res.status(200).json({
            success: false,
            message: error.message
            })
    }
}
module.exports = checkUserAuth
