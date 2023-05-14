// Handling Uncaught Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down due to Uncaught Exception`);
    process.exit(1)

})

const app = require('./app')

const dotenv = require('dotenv')
dotenv.config({path:"backend/config/config.env"})

const connectDatabase = require('../backend/config/database')
connectDatabase();

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
})

// Unhandled Promise Rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down due to Unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    })
})