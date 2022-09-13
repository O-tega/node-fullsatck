const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require('../utils/errorResponse');



// @Descr   Create/Add course
// @Route   POST route /api/bootcamp/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler(async(req, res, next)=>{
    //  Add user to course data object
    req.body.user = req.user.id

    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  
    if(!bootcamp){
        return next(
            new ErrorResponse(`No bootcamp with the id ${req.params.bootcampId}`, 404)
        )
    }

    	// Check bootcamp owner by user id
		if(bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
			return next(
				new ErrorResponse(`User: ${req.user.id} is unauthorised`, 401)
			)
		}

    const course = await Course.create(req.body)
    

    res.status(200).json({
        success: true,
        data: course
    })
})


// @Descr   GET all courses
// @Route   GET route /api/course
// @Route   GET route /api/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async(req, res, next)=>{

    if(req.params.bootcampId){
        const courses = await Course.find({bootcamp: req.params.bootcampId})

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    }else{
        res.status(200).json(res.advancedResult)
    }

})

// @Descr   GET single courses
// @Route   GET route /api/course/:id
// @access  Public
exports.getCourse = asyncHandler(async(req, res, next)=>{
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })
    if (!course){
        return next(
            new ErrorResponse(
                `incorrect format: course id not found for ${req.params.id}`, 404
            )
        )

    }
    res.status(200).json({
        success: true,
        data: course
    })
})

// @Descr   UPDATE single courses
// @Route   PUT route /api/course/:id
// @access  Private
exports.updateCourse = asyncHandler(async(req, res, next)=>{
    let course = await Course.findById(req.params.id)
    if (!course) {
			return next(
				new ErrorResponse(
					`incorrect format: course id not found for ${req.params.id}`, 404
				)
			);
		}

        	// Check bootcamp owner by user id
		if(course.user.toString() !== req.user.id && req.user.role !=='admin'){
			return next(
				new ErrorResponse(`User: ${req.user.id} is unauthorised`, 401)
			)
		}

        // update course
        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidatorslidators: true
        })
    res.status(200).json({
        success: true,
        data: course
    })
})

// @Descr   DELETE single courses
// @Route   DELETE route /api/course/:id
// @access  Private
exports.deleteCourse = asyncHandler(async(req, res, next)=>{
    const course = await Course.findById(req.params.id)
    
    if(!course){
        return next(
            new ErrorResponse(
                `Incorrect format: course ID not found for ${req.params.id}`
            )
        )
    }
     	// Check bootcamp owner by user id
		if(course.user.toString() !== req.user.id && req.user.role !=='admin'){
			return next(
				new ErrorResponse(`User: ${req.user.id} is unauthorised`, 401)
			)
		}

    await course.remove()
     const courses = await Course.find()

    res.status(200).json({
        success: true,
        count: courses.length,
        info: `course with ID ${req.params.id} has been deleted`,
        data: courses,
    })
})
