const mongoose = require('mongoose')
const users = require('../model/users')
const usersInfo = require('../model/usersInfo');
const freightOrder = require('../model/FreightOrder')

class CarrierController {
    // handle pending orders made by customers
    static async HandleOrder(req, res) {
        try {
            const userid = req.user.id;
            const { nstatus } = req.body;
            const orderid = req.params.orderid;
            const user = await usersInfo.findOne({ userId: userid });

            if (user.role !== 'carrier') {
                return res.status(403).json({
                    success: false,
                    message: "Only carriers can update order status"
                });
            }
            const order = await freightOrder.findOne({ _id: orderid });
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }
            // status changed from pending to booked
            if (nstatus === 'booked' && order.status === 'pending') {
                order.carrierName = user.contactname;
                order.carrierId = userid;
                order.status = nstatus;
                await order.save();
                return res.status(200).json({
                    success: true,
                    message: "Status updated to booked"
                });
            }
            // status changed from booked to enroute
            if (nstatus === 'enroute' && order.status === 'booked') {
                order.status = nstatus;
                await order.save();
                return res.status(200).json({
                    success: true,
                    message: "Status updated to enroute"
                });
            }
            //status changed from enroute to past
            if (nstatus === 'past' && order.status === 'enroute') {
                order.status = nstatus;
                await order.save();
                return res.status(200).json({
                    success: true,
                    message: "Status updated to past"
                });
            }
            // status changed again to pending with carrier info removed (order cancel ki req ayi h tou agar status booked kia h tou status pending hoskta hai aur enroute pr anay k bad status pending nh hoskta)

            if (nstatus === 'pending') {
                if (order.status === 'booked' || order.status === 'enroute') {
                    if (order.status === 'enroute') {
                        return res.status(400).json({
                            success: false,
                            message: "Order is on the way, can't cancel"
                        });
                    }
                    order.carrierName = undefined;
                    order.carrierId = undefined;
                    order.status = nstatus;
                    await order.save();
                    return res.status(200).json({
                        success: true,
                        message: "Order is cancelled"
                    });
                }
            }

            return res.status(400).json({
                success: false,
                message: "Invalid status transition"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    // show all orders to all carriers status: pending and booked
    static async ShowOrdersCarrier(req, res) {
        try {
            const userid = req.user.id;
            const user = await usersInfo.findOne({ userId: userid });
            if (user.role === 'carrier') {
                const freightOrders = await freightOrder.find(
                    {
                        status: { $in: ['pending', 'booked'] }
                    }
                );
                res.status(200).json({
                    success: true,
                    data: freightOrders
                });
            }
            else {
                res.status(200).json({
                    success: false,
                    message: "you are not a carrier"
                });
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    //show requests near pickup
    // static async ShowOrderReqsNearPickup(req, res) {
    //     try {
    //         const userid = req.user.id;
    //         const user = await usersInfo.findOne({ userId: userid });
    //         if (user.role === 'carrier') {
    //             const latitude = req.body.latitude
    //             const longitude = req.body.longitude
    //             const nearme_loc = await freightOrder.aggregate([
    //                 {
    //                     $geoNear: {
    //                         near:
    //                         {
    //                             type: "Point",
    //                             coordinates: [parseFloat(longitude), parseFloat(latitude)]
    //                         },
    //                         key: "pickupcity",
    //                         maxDistance: parseFloat(1000) * 1069,
    //                         distanceField: "dist.calculated",
    //                         spherical: true
    //                     }
    //                 }
    //             ]);
    //             if (nearme_loc.length > 0) {
    //                 res.status(200).json({
    //                     success: true,
    //                     message: "Orders placed near you:",
    //                     data: nearme_loc
    //                 })
    //             }
    //             else {
    //                 res.status(200).json({
    //                     success: false,
    //                     message: "No Orders placed near you!"
    //                 })
    //             }
    //         }
    //         else {
    //             res.status(200).json({
    //                 success: false,
    //                 message: "you are not the carrier!"
    //             })
    //         }
    //     }
    //     catch (error) {
    //         res.status(500).json({
    //             success: false,
    //             message: error.message
    //         });
    //     }
    // }

    // show requests near pickup and dropoff
    static async ShowOrderReqsNearPickupAndDropoff(req, res) {
        try {
            const userid = req.user.id;
            const user = await usersInfo.findOne({ userId: userid });
    
            if (user.role === 'carrier') {
                const platitude = req.body.platitude ? parseFloat(req.body.platitude) : null;
                const plongitude = req.body.plongitude ? parseFloat(req.body.plongitude) : null;
                const dlatitude = req.body.dlatitude ? parseFloat(req.body.dlatitude) : null;
                const dlongitude = req.body.dlongitude ? parseFloat(req.body.dlongitude) : null;
                const maxDistance = 1000;
    
                let ordersNearLocation = [];
    
                if (platitude && plongitude) {
                    // Query: Find orders near the pickup location
                    ordersNearLocation = await freightOrder.aggregate([
                        {
                            $geoNear: {
                                near: {
                                    type: "Point",
                                    coordinates: [plongitude, platitude]
                                },
                                key: "pickupcity",
                                maxDistance: maxDistance,
                                distanceField: "dist.calculated",
                                spherical: true
                            }
                        }
                    ]);
                }
    
                if (dlatitude && dlongitude) {
                    if (ordersNearLocation.length > 0) {
                        // Filter the orders that are also near the dropoff location
                        ordersNearLocation = ordersNearLocation.filter(order => {
                            const dlocation = order.dropoffcity.coordinates;
                            const dropoffDistance = calculateDistance(
                                dlatitude, dlongitude,
                                dlocation[1], dlocation[0]
                            );
                            return dropoffDistance <= maxDistance;
                        });
                    } else {
                        // Query: Find orders near the dropoff location
                        ordersNearLocation = await freightOrder.aggregate([
                            {
                                $geoNear: {
                                    near: {
                                        type: "Point",
                                        coordinates: [dlongitude, dlatitude]
                                    },
                                    key: "dropoffcity",
                                    maxDistance: maxDistance,
                                    distanceField: "dist.calculated",
                                    spherical: true
                                }
                            }
                        ]);
                    }
                }
    
                if (ordersNearLocation.length > 0) {
                    res.status(200).json({
                        success: true,
                        message: "Orders placed near your specified locations:",
                        data: ordersNearLocation
                    });
                } else {
                    res.status(200).json({
                        success: false,
                        message: "No orders placed near your specified locations!"
                    });
                }
            } else {
                res.status(200).json({
                    success: false,
                    message: "You are not the carrier!"
                });
            }
            // Helper function to calculate distance between two coordinates in meters
        function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Radius of the Earth in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
    
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
        const distance = R * c;
        return distance;
    }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    
    

  
    




}

module.exports = CarrierController