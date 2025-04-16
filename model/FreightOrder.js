const mongoose = require('mongoose')

const freightorderSchema = new mongoose.Schema({

firstname:{
    type: String,
    required: true
},
companyname:{
    type: String,
    required: true
},
email:{
    type: String,
    required: true,
    unique: true
},
phone:{
    type: String,
    required: true
},

fax:{
    type: String,
    required: true
},
pickupdate:{
    type: Date,
    required: true
},
deliverydate:{
    type: Date,
    required: true
},
suggestrate:{
    type: String,
    required: true
},
pickupcity:{
    type:{
        type: String,
        required: true
       },
       coordinates:[]
},
pickupprovince:{
    type: String,
    required: true
},
pickupzip:{
    type: String,
    required: true
},
pickupcountry:{
    type: String,
    required: true
},
dropoffcity:{
    type:{
        type: String,
        required: true
       },
       coordinates:[]
},
dropoffprovince:{
    type: String,
    required: true
},
dropoffzip:{
    type: String,
    required: true
},
otherinfo:{
    enum: ['Full Load','Half Load','No Load'],
    type: String,
    default: 'Full Load'
},
pallets:{
    enum: ['Yes','No'],
    type: String,
    required: true
},
exchangepallets:{
    enum: ['Yes','No'],
    type: String,
    required: true
},
numofpallets:{
    type: String,
    required: true
},
equipmentType:{
    enum: ['HotShot', 'Flatbed with Pallet EX','Flatbed','Curtain Van','Trailer','Van - cargo', 'Van - vented', 'Straight Trucks','Maxi','Removable Gooseneck'],
    type: [String]
},
tarp:{
    enum: ['Yes','No'],
    type: String,
    required: true
},
driverassist:{
    enum: ['Yes','No'],
    type: String,
    required: true
},
othercomments:{
    type: String
},
driverinstructions:{
    type: String
},
userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usersInfo',
    required: true
},
status:{
    enum: ['pending','booked','enroute','past'],
    type: String,
    default: 'pending'
},
carrierId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usersInfo'
},
carrierName:{
    type: String
}
},
{ timestamps: true } 
)

freightorderSchema.index({pickupcity:'2dsphere'})
freightorderSchema.index({dropoffcity:'2dsphere'})

module.exports = mongoose.model('freightorder', freightorderSchema)