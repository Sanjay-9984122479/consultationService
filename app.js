const express = require('express');
const cors = require('cors');
const dbConnection = require('./src/connection/mongodbConnection');
require("dotenv").config();
const routes = require('./src/routes/index');
const path = require('path');
const sendReminders = require('./src/middleware/mailReminder');

const app = express();
app.use(cors());
app.use(express.json());
app.use("/",routes)

dbConnection().then(()=>{
    console.log("db is conected");
})

sendReminders();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5001;
app.listen(5001,()=>{
    console.log("client services running port "+process.env.PORT)
})
