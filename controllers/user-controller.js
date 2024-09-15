const User = require('../models/user-model');
const UserAvailability = require('../models/user-availability-model');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const calendarUtil = require('../util/calendar-util');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const DT_FMT = 'YYYY-MM-DD HH:mm:ss';
const JWT_SECRET = '!5mT;(AAr!}$,x17bB9Q"JG$b6{Z+m9|6(c6a9o|gro]1-1hI`';

exports.registerUser = (req, res, next) => {
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
        const emailId = req.body.userEmail;
        const password = req.body.userPassword;
        User.findOne({ emailId: emailId }).then(userDoc1 => {
            if (userDoc1) {
                return res.status(400).json({
                    message: 'Email id already exists!',
                    status: 'BAD_REQUEST'
                });
            }
            else {
                bcrypt.hash(password, 12).then(hashedPassword => {
                    const user = new User({
                        emailId: emailId,
                        password: hashedPassword,
                        fullName: fullName
                    });
                    console.log('user details----------> ', user);
                    user.save().then(result => {
                        console.log(result);
                        return res.status(201).json({
                            message: 'User created successfully!',
                            status: 'SUCCESS'
                        });
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).json({
                            message: 'Unable to create user!',
                            status: 'INTERNAL ERROR'
                        });
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Problem while saveing user details',
                status: 'INTERNAL ERROR OCCURED'
            });
        });
    }
};

exports.loginUser = (req, res, next) => {
    const emailId = req.body.userEmail;
    const password = req.body.userPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            'errors': errors.array(),
            'message': 'Invalid request data'
        });
    }
    else {
        User.findOne({ emailId: emailId }).then(userDoc => {
            if (!userDoc) {
                return res.status(400).json({
                    message: 'Invalid Email id or password!',
                    status: 'BAD_REQUEST'
                });
            }
            else {
                bcrypt.compare(password, userDoc.password).then(doMatch => {
                    if (!doMatch) {
                        return res.status(400).json({
                            message: 'Invalid Email id or password!',
                            status: 'BAD_REQUEST'
                        });
                    }
                    else {
                        const claims = { principalId: userDoc._id, role: 'USER', email: userDoc.emailId }
                        const jwtToken = jwt.sign(claims, JWT_SECRET, { expiresIn: '1h' });
                        return res.status(200).json({
                            message: 'Authentication successful',
                            status: 'SUCCESS',
                            token: jwtToken
                        });
                    }
                });
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Unable to login the user!',
                status: 'INTERNAL ERROR OCCURED'
            });
        });
    }
};

exports.getUserDashboard = (req, res, next) => {
    console.log('security principal---------------> ', req.loggedInPrincipal);
    res.status(200).json({
        sessions: [{ id: '1234123412431234', title: 'ZZZZ' }, { id: '345346346543', title: 'XXXXX' }, { id: '698687966789', title: 'VVVVVVVV' }, { id: '7689768976897', title: 'UUUUUUUU' }]
    });
};

exports.populateMonthlyCalendar = (req, res, next) => {
    const month = req.body.month;
    const year = req.body.year;
    console.log('received month-------------> ', month, year);
    return res.status(200).json({
        month: month,
        year: year,
        days: calendarUtil.populateMonthlyCalendar(year, month)
    });
};

exports.populateDayCalendar = async (req, res, next) => {
    const { month, date, year, interval } = req.body;
    console.log(month, '------', date, '-----', year, '----', interval);
    return res.status(200).json({
        month: month,
        date: date,
        year: year,
        hours: await calendarUtil.populateUserDayCalendar(
            year, month, date, interval, req.loggedInPrincipal.principalId)
    });
};

exports.saveAvailability = (req, res, next) => {
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
        console.log('**********************************')
        console.log(req.body.startTime, req.body.endTime, req.body.interval);
        const fromDate = dayjs.utc(req.body.startTime, DT_FMT).toDate();
        const toDate = dayjs.utc(req.body.endTime, DT_FMT).toDate();
        console.log('formatted frm dt-------> ', fromDate);
        console.log('formatted to date------> ', toDate);
        const interval = req.body.interval;
        UserAvailability.find({
            startTime: { $gte: fromDate },
            endTime: { $lte: toDate }
        }).then(userDoc => {
            console.log(userDoc);
            if (userDoc && userDoc.length > 0) {
                return res.status(409).json({
                    message: 'Time slot already marked as available',
                    status: 'BAD_REQUEST'
                });
            }
            else {
                const availability = new UserAvailability({
                    userId: req.loggedInPrincipal.principalId,
                    startTime: fromDate,
                    endTime: toDate,
                    intervalType: interval
                });
                availability.save().then(resp => {
                    console.log(resp);
                    return res.status(200).json({
                        message: 'Availability added successfully',
                        status: 'SUCCESS'
                    });
                }).catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Unable to save the availability',
                        status: 'INTERNAL_ERROR'
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Unable to add the availability',
                status: 'INTERNAL_ERROR'
            });
        });
    }
};

exports.availabilityList = async (req, res, next) => {
    const userId = req.loggedInPrincipal.principalId;
    const docs = await UserAvailability.find
        ({ userId: userId }).sort({startTime:1}).exec();
    let dataMap = new Map();                            
    docs.forEach(document => {
        const key = dayjs(document.startTime).format('MMMM DD, YYYY');
        const row = {
            fromDate: dayjs(document.startTime).format('dddd, MMMM D, YYYY h:mm A'),
            toDate: dayjs(document.endTime).format('dddd, MMMM D, YYYY h:mm A')                
        }
        if(!dataMap.has(key))   {
            let values = [row];
            dataMap.set(key,values);
        }
        else    {
            const values = dataMap.get(key);
            values.push(row);
            dataMap.set(key,values);
        }
    });
    const data = Array.from(dataMap);
    return res.status(200).json({ data });
};