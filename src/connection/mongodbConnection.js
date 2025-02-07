const mongoose = require('mongoose');

const dbConnection =()=> mongoose.connect(process.env.MONGODB_URI);

module.exports = dbConnection;