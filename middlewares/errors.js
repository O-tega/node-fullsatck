const ErrorResponse = require('../utils/errorResponse');


const errorHandler = (err, req, res, next)=>{
    let error = {...err}

    console.log(err)

    error.message = err.message

    // Mongoose bad ObjectID
    if(err.name === 'CastError' ){
        const message = `Resource not found for the ID ${err.value}`
        error = new ErrorResponse(message, 404)

    }

    // Mongoose duplicate error
    if (err.code === 11000){
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400)

    }
    // Mongoose Validation Error
    if (err.name === 'ValidationError'){  
        const message = Object.values(err.errors).map(val => val.message)
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "server err"
    })
}

module.exports = errorHandler;