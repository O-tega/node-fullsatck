const jwt = require('jsonwebtoken');
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User');
const { removeListener } = require('../models/User');


// protect route 
exports.protect = asyncHandler(async (req, res, next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token= req.headers.authorization.split(' ')[1];
    }
    // elseif(req.cookie.token){
    //     token = req.cookie.token
    // }


    // make sure token exist
    if(!token){
        return next(
            new ErrorResponse('unauthorized access', 401)
        )
    }

    // verify token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        console.log(decoded)

        req.user = await User.findById(decoded.id)
        next()

    }catch(err){
         return next(
            new ErrorResponse('unauthorized access', 401)
        )
        console.log(err)
    }
})


// roles authorization
exports.authorize =(...roles)=>{
    return(req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(
                new ErrorResponse(`${req.user.role} is not allowed to access this route`, 403)
            )
        }
        next()
    }
}

