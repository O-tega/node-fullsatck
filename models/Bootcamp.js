const mongoose = require("mongoose");
// import slugify middleware to contantenate name string
const slugify = require('slugify');
// Import geocoder for location formatting
const geoCoder = require('../utils/geocoder');
// Import course model
const Course = require('./Course')


const Schema = mongoose.Schema; 

const BootcampSchema = new Schema(
	{
		name: {
			type: String,
			required: [
				true,
				"name is required",
			],
			unique: true,
			trim: true,
			maxlength: [
				50,
				"cannot exceed 50 characters",
			],
		},
		slug: String,
		description: {
			type: String,
			required: [
				true,
				"description is required",
			],
			maxlength: [
				500,
				"cannot exceed 500 characters",
			],
		},
		website: {
			type: String,
			match: [
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
				"please use a valid url with http or https",
			],
		},
		phone: {
			type: String,
			maxlength: [
				20,
				"cannot exceed 20 characters",
			],
		},
		email: {
			type: String,
			match: [
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				"please enter a valid email address",
			],
		},
		address: {
			type: String,
			required:
				"please enter an address",
		},
		location: {
			// GeoJSON point
			type: {
				type: String,
				enum: ["Point"],
				// required: true,
			},
			coordinates: {
				type: [Number],
				// required: true,
				index: "2dsphere",
			},
			formattedAddress: String,
			street: String,
			city: String,
			state: String,
			zipCode: String,
			country: String,
		},
		careers: {
			// Arrays of string
			type: [String],
			required: true,
			enum: [
				"Web Development",
				"Mobile Development",
				"UI/UX",
				"Data Science",
				"Business",
				"Other",
			],
		},
		averageRating: {
			type: Number,
			min: [
				1,
				"Rating must be at least 1",
			],
			max: [
				10,
				"Rating must not be more than 10",
			],
		},
		averageCost: Number,
		photo: {
			type: String,
			default: "no-photo.jpg",
		},
		housing: {
			type: Boolean,
			default: false,
		},
		jobAssistance: {
			type: Boolean,
			dafault: false,
		},
		jobGurantee: {
			type: Boolean,
			dafault: false,
		},
		acceptGI: {
			type: Boolean,
			dafault: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// create User slug for name
BootcampSchema.pre('save', function(next){
	this.slug = slugify(this.name, {lower: true})
	next()
})

// Geocode and create location field
BootcampSchema.pre('save', async function(next){
	const loc = await geoCoder.geocode(this.address)
	this.location = {
		type: 'Point',
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipCode: loc[0].zipcode,
		country: loc[0].countryCode		
	}
	// Do not save address in the Db
	this.address = undefined; 
	next();
})

// Cascade delete courses when a botcamp is deleted
BootcampSchema.pre('remove', async function(next){
	console.log(`courses been removed from boot camp: ${this._id}`);
	await this.model('Course').deleteMany({bootcamp: this._id});
	next();
})

// Reverse populate bootcamp with courses
BootcampSchema.virtual('courses', {
	ref: Course,
	localField: '_id',
	foreignField: 'bootcamp',
	justOne: false
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)
