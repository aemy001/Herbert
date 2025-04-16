const mongoose = require('mongoose')

const connectDB =()=>{
    connection = mongoose.connect('YOUR_CONN_STRING')
    const db = mongoose.connection

db.on("error",(err)=>{console.log(err)})
db.once("open",()=>{console.log('DB CONNECTED')})

}
module.exports = connectDB