const express = require('express')
const app = express();

const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())

const product = require('./routes/productRoute')
app.use('/api/v1',product)

const user = require('./routes/userRoutes')
app.use('/api/v1',user)

const order = require('./routes/orderRoute')
app.use('/api/v1',order)

module.exports = app;
