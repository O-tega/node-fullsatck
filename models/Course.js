const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CourseSchema = new Schema({
	title: {
		type: String,
		required: [
			true,
			"Please add a title"
		],
		unique: true
	},
	description: {
		type: String,
		required: [
			true,
			"Please add description",
		],
	},
	weeks: {
		type: Number,
		required: [
			true,
			"Please add The duration length of the course",
		],
	},
    tuition:{
        type : Number,
        required : [true, "please add a number"]
    },
	minimumSkill: {
		type: String,
		required: [true, "please add a skill"],
        enum: ["beginner", "intermediate", "advanced"]
	},
	scholarshipsAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
    bootcamp:{
        type : mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
    },
	user:{
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	}
});


// Static method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId){
	// console.log('calculating average cost...'.blue)

	const obj =  await this.aggregate([
		{$match : {bootcamp: bootcampId}},

		{$group : {
			_id: '$bootcamp',
			averageCost: {$avg: '$tuition'}
		}}
	]);

	try{
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost : Math.ceil(obj[0].averageCost / 10) * 10
		})

	}catch(err){
		console.error(err)
	}

	// console.log(obj)
}


// Call average cost after save
CourseSchema.post('save', function(){

	this.constructor.getAverageCost(this.bootcamp);
})

// Call average cost before remove
CourseSchema.pre('remove', function(){

	this.constructor.getAverageCost(this.bootcamp);
})



module.exports = mongoose.model('Course', CourseSchema );