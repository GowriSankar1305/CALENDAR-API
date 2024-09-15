const express = require('express');
const {body} = require('express-validator');
const userController = require('../controllers/user-controller');
const tokenValidator = require('../util/jwt-validator');
const router = express.Router();

router.post('/user/signup',[
    body('userEmail','Email id is required').trim().notEmpty(),
    body('fullName','Full name is required').trim().notEmpty(),
    body('userEmail','Invalid email id received').isEmail(),
    body('userPassword','Password is required').notEmpty()],
    userController.registerUser);
router.post('/user/login',[
    body('userEmail','Email id is required').trim().notEmpty(),
    body('userPassword','Password is required').trim().notEmpty(),
    body('userEmail','Invalid email id received').isEmail()],
    userController.loginUser);
router.post('/user/dashboard',tokenValidator.validateRequest,userController.getUserDashboard);
router.post('/user/monthlyCalendar',tokenValidator.validateRequest,[
    body('month','Invalid month selected').isInt({min:1,max:12}),
    body('year','Invalid year selected').isInt({min: new Date().getFullYear()})
],userController.populateMonthlyCalendar);
router.post('/user/dayCalendar',tokenValidator.validateRequest,[
    body('month','Invalid month').isInt(),
    body('date','Invalid date').isInt(),
    body('year','Invalid year').isInt()
],userController.populateDayCalendar);
router.post('/user/addAvailability',tokenValidator.validateRequest,[
    body('startTime','Start time is invalid!').trim().notEmpty(),
    body('endTime','End time is invalid!').trim().notEmpty(),
    body('interval','Interval type is needed')
],userController.saveAvailability);
router.post('/user/availabilityList',tokenValidator.validateRequest,userController.availabilityList);

module.exports = router;