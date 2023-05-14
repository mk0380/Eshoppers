// const { forgetPassword } = require("../controllers/productController");
const { registerUser, loginUser, logout, forgetPassword, resetPassword, isAuthenticatedUser, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, authorizeRoles, updateUserRole, deleteUser } = require("../controllers/userController");

const express = require('express')
const router = express.Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logout)
router.route('/password/forgot').post(forgetPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/me').get(isAuthenticatedUser, getUserDetails)
router.route('/password/update').put(isAuthenticatedUser, updatePassword)
router.route('/profile/update').put(isAuthenticatedUser, updateProfile)
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles, getAllUser)
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles, getSingleUser).put(isAuthenticatedUser,authorizeRoles, updateUserRole).delete(isAuthenticatedUser,authorizeRoles, deleteUser)

module.exports = router