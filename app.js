const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/admin-routes');
const userRoutes = require('./routes/user-routes');

const app = express();
app.use(bodyParser.json());
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','*');
    res.setHeader('Access-Control-Allow-Methods','*');
    next();
});
app.use(userRoutes);
app.use(adminRoutes);
mongoose.connect('mongodb://localhost:27017/duaess')
.then(resp => {
    console.log('**************Connected to database**********');
    app.listen(9898);
})
.catch(err => {
    console.log(err);
});