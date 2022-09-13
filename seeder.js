const fs = require("fs");
const mongoose = require('mongoose');
const colors = require("colors");
const dotenv = require("dotenv");

// load vars
dotenv.config({
	path: "./config/config.env",
});

// load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require('./models/User')

// connect database
mongoose.connect(
	process.env.MONGO_URI,
	{
		// useNewUrlParser: true,
		// useCreateIndex: true,
		// useFindAndModify: false
	}
);

// Read JSON files
const bootcamp = JSON.parse(
	fs.readFileSync(
		`${__dirname}/data/bootcamps.json`,
		"utf-8"
	)
);
// JSON FIle FOR COURSE
const course = JSON.parse(
	fs.readFileSync(
		`${__dirname}/data/courses.json`,
		"utf-8"
	)
);

// JSON FILE FOR USER
const user = JSON.parse(
    fs.readFileSync(
        `${__dirname}/data/users.json`,
        'utf-8'
    )
)

// Boot camp Data
// Import into db
const importData = async ()=>{
    try{
        await Bootcamp.create(bootcamp)
        await Course.create(course)
        await User.create(user)

        console.log('data imported...'.green.inverse)
        process.exit()
    }catch(err){
        console.log('Error :', err)
    }
}


// Delete data in db
const deleteData = async ()=>{
    try{
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()

        console.log('data deleted...'.red.inverse)
        process.exit()
    }catch(err){
        console.log('Error :', err)
    }
}

// check to add or delete data
if(process.argv[2]==='-i'){
    importData()
}else if (process.argv[2]==='-d'){
    deleteData()
}