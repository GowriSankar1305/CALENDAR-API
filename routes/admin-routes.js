const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin-controller');

const router = express.Router();
router.post('/admin/register',
    [
        body('emailId','Invalid email id').isEmail(),
        body('fullName','Full name is required').trim().notEmpty(),
        body('adminPassword','Password is required').trim().notEmpty(),
        body('mobileNo','Mobile number is required').trim().notEmpty()
    ],
    adminController.registerAdmin);
module.exports = router;