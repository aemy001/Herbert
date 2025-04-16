const mongoose = require('mongoose');

const usersInfoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'carrier'],
        required: true
    },
    // Fields for 'customer'
    age: {
        type: Number,
        required: function () { return this.role === 'customer'; }
    },
    phone: {
        type: String,
        required: function () { return this.role === 'customer'; }
    },
    address: {
        type: String,
        required: function () { return this.role === 'customer'; }
    },
    // Fields for 'carrier'
    carrName: {
        type: String,
        required: function () { return this.role === 'carrier'; }
    },
    dotnumber: {
        type: String,
        required: function () { return this.role === 'carrier'; }
    },
    contactname: {
        type: String,
        required: function () { return this.role === 'carrier'; }
    },
    contactemail: {
        type: String,
        unique: true,
        required: function () { return this.role === 'carrier'; }
    },
    phone: {
        type: String,
        required: function () { return this.role === 'carrier'; }
    },
    fax: {
        type: String
    },
    website: {
        type: String
    },
    listpLanes: {
        type: String,
        required: function () { return this.role === 'carrier'; }
    },
    listbackhaul: {
        type: String,
        required: function () { return this.role === 'carrier'; }
    },
    documents: {
        type: String,
        required: function () { return this.role === 'carrier'; }
    },
    equipmentType: {
        enum: ['HotShot', 'Flatbed with Pallet EX','Flatbed','Curtain Van','Trailer','Van - cargo', 'Van - vented', 'Straight Trucks','Maxi','Removable Gooseneck'],
    type: [String],
    required: function () { return this.role === 'carrier'; }
    },
    miscinfo: {
        type: String
    }
},
{ timestamps: true } );

module.exports = mongoose.model('usersInfo', usersInfoSchema);
