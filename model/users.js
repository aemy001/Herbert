const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    password:{
        type: String,
        require: true
    },
    // role:{
    //     enum : ['customer','carrier','null'],
    //     type: String,
    //     default: 'null'
    // }


},
{ timestamps: true } )

module.exports = mongoose.model('users', userSchema)