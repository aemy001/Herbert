const mongoose = require('mongoose')
const users = require('../model/users')
const usersInfo = require('../model/usersInfo');
const freightOrder = require('../model/FreightOrder')

class CustomerController{

// create freight order
static async FreightOrder(req, res) {
    try{
        const userid = req.user.id
        const userss = await usersInfo.findOne({userId: userid})
     if(userss.role === 'customer'){
        const {companyname,fax,pickupdate,deliverydate,suggestrate,pickupprovince,pickupzip,pickupcountry,dropoffprovince,dropoffzip,otherinfo,pallets,exchangepallets,numofpallets,equipmentType,tarp,driverassist,othercomments,driverinstructions} =req.body
        const userrrr = await users.findOne({ _id: userid})
        const plongitude = parseFloat(req.body.plongitude);
        const platitude = parseFloat(req.body.platitude)
        const pickupcity = { type: "Point", coordinates: [plongitude, platitude] }
        const dlongitude = parseFloat(req.body.dlongitude);
        const dlatitude = parseFloat(req.body.dlatitude)
        const dropoffcity = { type: "Point", coordinates: [dlongitude, dlatitude] }
        const freightorder = new freightOrder({
        firstname: userrrr.name,
        companyname:companyname,
        email:userrrr.email,
        phone:userss.phone,
        fax:fax,
        pickupdate: new Date(pickupdate),
        deliverydate: new Date(deliverydate),
        suggestrate:suggestrate,
        pickupcity:pickupcity,
        pickupprovince:pickupprovince,
        pickupzip:pickupzip,
        pickupcountry:pickupcountry,
        dropoffcity:dropoffcity,
        dropoffprovince:dropoffprovince,
        dropoffzip:dropoffzip,
        otherinfo:otherinfo,
        pallets:pallets,
        exchangepallets:exchangepallets,
        numofpallets:numofpallets,
        equipmentType: equipmentType,
        tarp:tarp,
        driverassist:driverassist,
        othercomments:othercomments,
        driverinstructions:driverinstructions.FreightOrder,
        userId: userid
    })
    await freightorder.save();
        res.status(200).json({
            success: true,
            message: "freight order has been placed"
        });
    }
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
    }

//Display orders to customer made by that specific customer
static async ShowOrders(req, res) {
    try {
        const userid = req.user.id;
        const user = await usersInfo.findOne({ userId: userid });
        if (user.role === 'customer') {
            const freightOrders = await freightOrder.find({ userId: userid });
            const allOrders = freightOrders.map(order => ({
                reference: order._id,
                pickupdate: order.pickupdate,
                deliverydate: order.deliverydate,
                status: order.status,
                carrierId: order.carrierId,
                carrierName: order.carrierName
            }));

            res.status(200).json({
                success: true,
                data: allOrders
            });
        } else {
            res.status(200).json({
                success: false,
                message: "User is not authorized to view orders"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
}

module.exports = CustomerController