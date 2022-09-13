const {
	getCourses,
	createCourse,
	getCourse,
	updateCourse,
	deleteCourse,
} = require("../controllers/courseController");

const advancedResult = require('../middlewares/advancedResult')
const Course = require('../models/Course')

const router =
	require("express").Router({mergeParams: true});

	// import protect route
const { protect, authorize } = require('../middlewares/auth')

// get all courses, post course
router
	.route("/")
	.get(
		advancedResult(Course, {
			path: "bootcamp",
			select: "name description",
		}),
		getCourses
	)
	.post(
		protect,
		authorize("publisher", "admin"),
		createCourse
	);

router
	.route("/:id")
	.get(getCourse)
	.put(
		protect,
		authorize("publisher", "admin"),
		updateCourse
	)
	.delete(
		protect,
		authorize("publisher", "admin"),
		deleteCourse
	);

module.exports = router;
