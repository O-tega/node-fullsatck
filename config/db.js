const mongoose = require('mongoose');
const color = require('colors')


const connectDB = async ()=>{
    try{
        const conn=await
        mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true,
            // useCreateIndex: true,
            // useFindAndModify: true
        });
        console.log(`Database is connected successfully at: ${conn.connection.host}`.cyan.underline.bold)
    }catch(err){
        console.log('Error: '.red, err);
        process.exit(1)
    }
         
}

module.exports = connectDB;