const express = require('express')
const bodyparser = require('body-parser')
const UserController = require('../controller/UserController')
const CarrierController = require('../controller/CarrierController')
const CustomerController = require('../controller/CustomerController')
const connectDB = require('../config/connectionDB')
const auth = require('../middleware/auth')
const multer = require('multer')
const route = express()
route.use(bodyparser.json())
connectDB()


// Configuring and validating the upload using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Providing an upload route
const uploadstorage = multer({ storage: storage });


// authorizations:
route.use('/usersinfo', auth)
route.use('/freightorder', auth)
route.use('/showorders', auth)
route.use('/handleorder/:orderid', auth)
route.use('/showorderscarrier', auth)
route.use('/showorderreqspickup', auth)
route.use('/logout', auth)

// user controller routes
route.get('/showorderscarrier', CarrierController.ShowOrdersCarrier)
route.get('/showorders', CustomerController.ShowOrders)
route.post('/register', UserController.Register)
route.post('/login', UserController.Login)
route.post('/logout', UserController.Logout)
route.post('/freightorder', CustomerController.FreightOrder)
route.post('/handleorder/:orderid', CarrierController.HandleOrder)
route.post('/showorderreqspickup', CarrierController.ShowOrderReqsNearPickupAndDropoff)
route.post('/usersinfo', uploadstorage.single("documents"), UserController.UsersInfo)



module.exports = route