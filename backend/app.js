const express = require('express')
const app = express();

app.use(express.json())

const session = require('express-session')
app.use(session({
    secret:"efbwefnkjanfnkjn6jn3jn6n",
    resave: false,
    saveUninitialized: true  
}))

const product = require('./routes/productRoute')
app.use('/api/v1',product)

const user = require('./routes/userRoutes')
app.use('/api/v1',user)

module.exports = app;
