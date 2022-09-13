const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middlewares/logger')
const morgan = require('morgan')
const colors = require('colors')
const errorHandler = require('./middlewares/errors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')

// Import database
const connectDB = require('./config/db')

// import dotenv config
dotenv.config({path: "./config/config.env"})

// Import routes
const bootcampRoutes = require('./routes/bootcamp.routes');
const courseRoutes = require('./routes/courseRoutes.routes');
const authRoutes = require('./routes/authroutes.routes');



// Initialize Database
connectDB();




// initialize env





// Initialize app
const app = express();

// use body parser
app.use(express.json());

// initialize cookie parser
app.use(cookieParser())



// use middlewares
// app.use(logger)
// middleware dependencies that handles http logger info 
if(process.env.NODE_ENV==='development'){
	app.use(morgan('dev'))
}

// Upload files
app.use(fileUpload());

// Set static directory
app.use(express.static(path.join(__dirname, 'public')));

// initialize routes
app.use('/api/v1/bootcamp', bootcampRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/auth', authRoutes )

// initialize errorhandler middleware
app.use(errorHandler)












PORT = process.env.PORT || 5000


// Initialize server
app.listen(PORT,()=>{
	console.log(`server running successfully in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
})