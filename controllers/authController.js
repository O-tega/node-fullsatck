const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/User');



// @Descr   Register user
// @Route   POST route /api/v1/auth/register
// @access  Public

exports.register = asyncHandler( async (req, res, next)=>{
    const{name, email, password, role} = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

   // store cookie in the broswer instead of sending the token 
    sendTokenResponse(user, 200, res)

})


// @Descr   Login user
// @Route   POST route /api/v1/auth/login
// @access  Public

exports.login = asyncHandler( async (req, res, next)=>{

    // validate email & password
    
    const{email, password} = req.body
    const user = await User.findOne({email}).select('+password')

    // check if email and password are provided

    if(!email || !password){
        return next(
            new ErrorResponse(
                'please include an email and password', 400
            )
        )
    }
// Check if user is in the database
    if(!user){
        return next(
            new ErrorResponse(
                `Invalid Credentials`, 401
            )
        )
    } 

// check if password matches
const isMatch = await bcrypt.compare(password, user.password)

if(!isMatch){
     return next(
            new ErrorResponse( 
                'Invalid Credentials', 400
            )
        )
    }

    // store cookie in the broswer instead of sending the token 
    sendTokenResponse(user, 200, res)

})

// @desc    Get current user
// @route   Get /api/v1/me
// @access  Private
exports.getMe =asyncHandler (async(req, res, next)=>{
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc    Forgot pasword
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler (async(req, res, next)=>{
    let user = await User.findOne({email: req.body.email})

    if(!user){
        return next(
            new ErrorResponse(`${req.body.email} does not exist`, 404)
        )
    }
    
    // const resetToken = (user)=>{
    //     // generate token
    //         const resetToken = crypto.randomBytes(20).toString('hex')
    //         console.log(resetToken)
    
    //         // hash token and send to the resetPasswordToken field
    //       user.resetPasswordToken = crypto
    //                     .createHash("sha256")
    //                     .update(resetToken)
    //                     .digest("hex");
        
    
    //         user.resetPasswordExpire = new  Date(Date.now() + 10 * 60 * 1000)    
    // } 
    // resetToken(user)

    // await user.save({validateBeforeSave: false})  

    res.status(200).json({
        success: true,
        data: user    
    })
})

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res)=>{

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })

    const options ={
        expires: Date.parse(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if(process.env.NODE_ENV==='production'){
        options.secure = true
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
        })

}

// Generate Hash password and token
//   const getPasswordToken =(user)=> {
        
//         // generate token
//         const resetToken = crypto.randomBytes(20).toString('hex')
        
//         // hash token and send to the resetPasswordToken field
//         let {resetPasswordExpire, resetPasswordToken} = user

//         resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

//         // set Expire
//         resetPasswordExpire = new Date.now() + 10 * 60 * 1000
//         return resetToken

//     }