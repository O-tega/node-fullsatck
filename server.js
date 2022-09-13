const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middlewares/logger')
const morgan = require('morgan')
const colors = require('colors')
const errorHandler = require('./middlewares/errors')

// Import database
const connectDB = require('./config/db')

// import dotenv config
dotenv.config({path: "./config/config.env"})

// Import routes
const bootcampRoutes = require('./routes/bootcamp.routes');



// Initialize Database
connectDB();




// initialize env





// Initialize app
const app = express();

// use body parser
app.use(express.json());




// use middlewares
// app.use(logger)
// middleware dependencies that handles http logger info 
if(process.env.NODE_ENV==='development'){
	app.use(morgan('dev'))
}

// initialize routes
app.use('/api/v1/bootcamp', bootcampRoutes);

// initialize errorhandler middleware
app.use(errorHandler)












PORT = process.env.PORT || 5000


// Initialize server
app.listen(PORT,()=>{
	console.log(`server running successfully in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
})