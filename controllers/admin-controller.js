const Admin = require('../models/admin-model');
const bcrypt = require('bcrypt');

const { validationResult } = require('express-validator');

exports.registerAdmin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
            return res
            .status(422)
            .json({
                'errors': errors.array(),
                'message': 'Invalid request data',
                'status': 'BAD_REQUEST'
            });
    }
    else {
        const fullName = req.body.fullName;
        const emailId = req.body.emailId;
        const password = req.body.adminPassword;
        const mobileNo = req.body.mobileNo;
        console.log('received pwd-----> ', password);
        Admin.findOne({ emailId: emailId }).then(adminDoc1 => {
            if (adminDoc1) {
                return res.status(400).json({
                    message: 'Email id already exists!',
                    status: 'BAD_REQUEST'
                });
            }
            else {
                Admin.findOne({ mobileNo: mobileNo }).then(adminDoc2 => {
                    if (adminDoc2) {
                        return res.status(400).json({
                            message: 'Mobile number already exists!',
                            status: 'BAD_REQUEST'
                        });
                    }
                    bcrypt.hash(password, 12).then(hashedPassword => {
                        const admin = new Admin({
                            emailId: emailId,
                            fullName: fullName,
                            password: hashedPassword,
                            mobileNo: mobileNo
                        });
                        console.log('admin details--------> {}', admin);
                        admin.save().then(result => {
                            console.log(result);
                            return res.status(201).json({
                                message: 'Admin created successfully!',
                                status: 'SUCCESS'
                            });
                        }).catch(err => {
                            console.log(err);
                            return res.status(500).json({
                                message: 'Unable to create admin!',
                                status: 'INTERNAL ERROR'
                            });
                        });
                    });
                }).catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Problem while saving admin details',
                        status: 'INTERNAL ERROR OCCURED'
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Problem while saveing admin details',
                status: 'INTERNAL ERROR OCCURED'
            });
        });
    }
};

exports.loginAdmin = (req, res, next) => {
    const emailId = req.body.adminEmail;
    const password = req.body.adminPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            'errors': errors.array(),
            'message': 'Invalid request data'
        });
    }
    Admin.findOne({ emailId: emailId }).then(adminDoc => {
        if (!adminDoc) {
            return res.status(400).json({
                message: 'Invalid Email id or password!',
                status: 'BAD_REQUEST'
            });
        }
        bcrypt.compare(password, adminDoc.password).then(doMatch => {
            if (!doMatch) {
                return res.status(400).json({
                    message: 'Invalid Email id or password!',
                    status: 'BAD_REQUEST'
                });
            }
            return res.status(200).json({
                message: 'Authnetication successful',
                status: 'SUCCESS'
            });
        });
    });
};

exports.scheduleSession = (req, res, next) => {

};