// Import the models
const Bootcamp = require('../models/Bootcamp')
const User = require('../models/User')
// import error class
const ErrorResponse = require('../utils/errorResponse')
// import asyncHandler and wrap all async calls with the asyncHandler
const asyncHandler = require('../middlewares/async')
// import geocoder
const geocoder = require('../utils/geocoder')
path = require('path')




// @desc    Get all Users
// @route   Get /api/v1/bootcamp
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next)=>{

		// calling the advancedResult middleware 
		res.status(200).json(res.advancedResult)
})
  
// @desc    Get single Users
// @route   Get /api/v1/bootcamp/:id
// @access  Public
exports.getBootcamp = asyncHandler( async (req, res, next)=>{
		const bootcamp = await Bootcamp.findById(
			req.params.id
		);
		// if ID is not formatted correctly
		if (!bootcamp) {
			return next(
				new ErrorResponse(
					`Incorrect format: Bootcamp not found for the ID ${req.params.id}`,
					404
				)
			);
		}
			
		res.status(200).json({
			success: true, 
			data: bootcamp,
			});
})
// @desc    Create single Users
// @route   POST /api/v1/bootcamp
// @access  Public
exports.createBootcamp = asyncHandler( async (req, res, next)=>{
	// Add user to the object file
	req.body.user = req.user.id

	//  CHeck for pu/blished bootcamp
	const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

	// if the user is not an admin, they can only add one bootcamp
	if(publishedBootcamp && req.user.role !== 'admin'){
		return next(
			new ErrorResponse(`${req.user.id} already has a published bootcamp`, 400)
		)
	}


		bootcamp = await Bootcamp.create(req.body);

		res.status(201).json({
			success: true,
			data: bootcamp
		})
})

// @desc    Update single Users
// @route   PUT /api/v1/bootcamp
// @access  Private
exports.updateBootcamp = asyncHandler( async (req, res, next)=>{
		let bootcamp = await Bootcamp.findById(req.params.id)

		// check if userID exist
		if (!bootcamp){
			return next(
				new ErrorResponse(
					`Incorrect format: Bootcamp not found for the ID ${req.params.id}`,
					404
				)
			);
		}

		// Check bootcamp owner by user id
		if(bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
			return next(
				new ErrorResponse(`User: ${req.user.id} is unauthorised`, 401)
			)
		}

		// update bootcamp
		bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators:true
		})


		res.status(200).json({
			success : true,
			data: bootcamp
		});
})

// @desc    Delete single Users
// @route   DELETE /api/v1/bootcamp
// @access  Private
exports.deleteBootcamp = asyncHandler( async (req, res, next)=>{
		const bootcamp = await Bootcamp.findById(req.params.id);
		if(!bootcamp){
			return next(
				new ErrorResponse(
					`Incorrect format: Bootcamp not found for the ID ${req.params.id}`,
					404
				)
			);
		}
		if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
			return next(
				new ErrorResponse(`User: ${req.user.id} is not authorized`, 401)
			)
		}
		// triggered by the cascading delete middleware in bootcamp model
		bootcamp.remove()

		res.status(200).json({
			success: true, 
			msg: "Bootcamp is deleted"
		});
})


// @desc    Get bootcamps within a radius
// @route   DELETE /api/v1/bootcamp/:zipCode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler( async (req, res, next)=>{
	// pull out zipcode and distance from the url
	const {zipcode, distance} = req.params;

	// Get lng/lat from geocoder
	const loc = await geocoder.geocode(zipcode)
	const lat = loc[0].latitude;
	const lng = loc[0].longitude; 

	// calc the radius using radians
	// Divide distance by radius of the earth
	// Earth radius = 3,963 mi / 6,378 km
 
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: {$geoWithin: { $centerSphere: [ [ lng, lat ], radius ]}}
	})

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps
	})
})



// @desc    Upload photos for bootcamp
// @route   Get /api/v1/bootcamp/:id/photo
// @access  private
exports. bootcampPhotoUpload = asyncHandler( async (req, res, next)=>{
		const bootcamp = await Bootcamp.findById(
			req.params.id
		);
		// if ID is not formatted correctly
		if (!bootcamp) {
			return next(
				new ErrorResponse(
					`Bootcamp not found for the ID ${req.params.id}`,
					404
				)
			);
		}

		if(bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
			return next(
				new ErrorResponse(`User ${req.user.id} is not authorized`)
			)
		}


		if(!req.files){
			return next(
				new ErrorResponse(
					`Please upload a file`, 400
				)
			)
		}

		console.log(req.files)
		const file = req.files.undefined

		// Validating the document as a photo

		if (!file.mimetype.startsWith('image')){
			return next(
				new ErrorResponse(
					'please upload an image file', 404
				)
			)
		}

		// Check for file size
		if(file.sie > process.env.MAX_FILE_UPLOAD){
			return next(new ErrorResponse(
				`please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400
			))
		}

		// Create custom file name
		file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

		// Save file in the database
		file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=>{
			if(err){
				return next(
					new ErrorResponse(
						`There is a problem with file upload `
					)
				)
			}

			await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
		})

		res.status(200).json({
			success: true,
			data: file.name
		})

		
})