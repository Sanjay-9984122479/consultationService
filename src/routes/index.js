const express = require('express');
const routes = express();
const client = require('./client');
const doctor = require('./doctor');
const fileUploader = require('./fileUpload');
const appointments = require('./appointments');

routes.use("/client",client);
routes.use("/doctor",doctor);
routes.use("/images",fileUploader);
routes.use("/appointments",appointments);


module.exports = routes