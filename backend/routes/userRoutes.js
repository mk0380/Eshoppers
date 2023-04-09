// const { forgetPassword } = require("../controllers/productController");
const { registerUser, loginUser, logout, forgetPassword, resetPassword } = require("../controllers/userController");

const express = require('express')
const router = express.Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logout)
router.route('/password/forgot').post(forgetPassword)
router.route('/password/reset/:token').put(resetPassword)

module.exports = router