const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius,  } = require('../controllers/bootcampController')

const router = require('express').Router()


router.get('/', getBootcamps);

// get specific user
router.get('/:id', getBootcamp);
  
// create user
router.post('/', createBootcamp)

// create user
router.put('/:id', updateBootcamp)

// delete user
router.delete('/:id', deleteBootcamp)

// get bootcamps within the same radius
router.get("/radius/:zipcode/:distance", getBootcampsInRadius);


module.exports = router;