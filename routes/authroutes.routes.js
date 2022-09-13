const { register, login, getMe, forgotPassword } = require('../controllers/authController');

const router = require('express').Router();

const { protect } = require('../middlewares/auth')


router.post('/register', register )

router.post('/login', login )

router.get('/me', protect, getMe);

router.post('/forgetpassword', forgotPassword); 

module.exports = router;