const mongoose = require('mongoose')

const connectDatabase = () =>{
    mongoose.connect(process.env.DB_URL).then(()=>{
        console.log(`DB connected`);
    }).catch((err)=>{
        console.log(err.message);
    })
}

module.exports = connectDatabase