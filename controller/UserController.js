const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const users = require('../model/users')
const jwt = require('jsonwebtoken')
const usersInfo = require('../model/usersInfo');
const freightOrder = require('../model/FreightOrder')

class UserController {

    //register
    static async Register(req, res) {
        try {
            const { name, email, password, retypepassword } = req.body
            const checkemail = await users.findOne({ email: email })
            if (checkemail) {
                res.status(200).json({
                    success: false,
                    message: 'email already exists'
                })
            }
            else if (password !== retypepassword) {
                res.status(200).json({
                    success: false,
                    message: 'passwords donot match'
                })
            }
            else {
                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(password, salt)
                const userReg = new users({
                    _id: new mongoose.Types.ObjectId(),
                    name: name,
                    email: email,
                    password: hash,
                })
                await userReg.save();
                res.status(200).json({
                    success: true,
                    message: "user registered"
                })
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    //login
    static async Login(req, res) {
        try {
            const { email, password } = req.body
            const userexist = await users.findOne({ email: email })
            if (!userexist) {
                res.status(200).json({
                    success: false,
                    message: "invalid email"
                })
            }
            else {
                bcrypt.compare(password, userexist.password, (err, result) => {
                    if (err) {
                        res.status(200).json({
                            success: false,
                            message: err.message
                        })
                    }
                    if (result) {
                        const token = jwt.sign({
                            id: userexist._id,
                            name: userexist.name,
                            email: userexist.email
                        },
                            "04fc038d1d3bd41e0ae5ad130a5688c4", {
                            expiresIn: '125d'
                        }

                        )
                        res.status(200).json({
                            success: true,
                            data: {
                                id: userexist._id,
                                name: userexist.name,
                                email: userexist.email,
                                token: token
                            }
                        })
                    }
                })
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    // userRole auth
    static async UsersInfo(req, res) {
        try {
            const userId = req.user.id;
            const { role, age, phone, address, carrName, dotnumber, fax, website, listpLanes, listbackhaul, equipmentType, miscinfo } = req.body;
            const user = await users.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const docpath = req.file ? req.file.path : '';
            if (role === 'customer') {
                const userNewInfo = new usersInfo({
                    role: 'customer',
                    age: age,
                    phone: phone,
                    address: address,
                    userId: userId
                })
                await userNewInfo.save();
                return res.status(200).json({
                    success: true,
                    message: "User information updated"
                });
            }
            else if (role === 'carrier') {
                const userNewInfo = new usersInfo({
                    userId: userId,
                    role: 'carrier',
                    carrName: carrName,
                    dotnumber: dotnumber,
                    contactname: user.name,
                    contactemail: user.email,
                    phone: phone,
                    fax: fax,
                    website: website,
                    listpLanes: listpLanes,
                    listbackhaul: listbackhaul,
                    documents: docpath,
                    equipmentType: JSON.parse(equipmentType),
                    miscinfo: miscinfo,
                })
                await userNewInfo.save();
                return res.status(200).json({
                    success: true,
                    message: "User information updated"
                });
            }
            else {
                res.status(200).json({
                    success: true,
                    message: "Unable to update usersinfo"
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

 //logout user
 static async Logout(req, res) {

    const token = req.headers.authorization
    if (token) {
        res.status(200).json({
            success: true,
            message: "User logged out"
        })
        return console.log(token)
    }
    else {
        res.status(200).json({
            success: false,
            message: "Something went wrong, UNABLE TO LOGOUT"
        })
    }
}






}

module.exports = UserController