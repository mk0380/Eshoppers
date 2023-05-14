const User = require('../models/userModel')
const bcrypt =require('bcryptjs')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const hashPassword = async (password) =>{
    return await bcrypt.hash(password,10)
}

const comparePassword = async (password,hashed) =>{
    return await bcrypt.compare(password,hashed)
}

const createToken = async(user_id)=>{
    return jwt.sign({id:user_id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

exports.isAuthenticatedUser = async(req,res,next) =>{
    const {token} = req.cookies;
    if(!token){
        return res.status(401).json({
            success:false,
            message:"Please login to access this resource"
        })
    }
    const decodedData = jwt.verify(token,process.env.JWT_SECRET)
    
    req.user = await User.findById(decodedData.id)

    next()
}

exports.authorizeRoles = async(req,res,next)=>{
    if(req.user.role == "admin"){
        next()
    }else{
        return res.status(403).json({
            success:false,
            message:`Role: ${req.user.role} is not authorized to access this resource`
        })
    }
}

exports.forgetPassword = async(req,res,next)=>{
    try {
        let user = await User.findOne({email:req.body.email})
        if(!user){
            return res.status(404).json({
            success:false,
            message:"User not found"
        })
        }
        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        const resetPasswordExpire = new Date (Date.now()+ (5*60*1000))

        user = await User.findByIdAndUpdate(user._id,{resetPasswordToken,resetPasswordExpire})

        const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

        const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it`

        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message
        })

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })

    } catch (error) {

        let user = await User.findOne({email:req.body.email})
        user = await User.findByIdAndUpdate(user._id,{resetPasswordToken:undefined,resetPasswordExpire:undefined})

        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.resetPassword = async(req,res,next)=>{
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
        const user = await User.findOne({resetPasswordToken, resetPasswordToken: { $lt: Date.now()}})

        if(!user){
            return res.status(400).json({
                success:false,
                message:"Reset password token is invalid or expired"
            })
        }

        if(req.body.password!==req.body.confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password does not match"
            }) 
        }

        user.password = await hashPassword(req.body.password);
        user.resetPasswordExpire = undefined
        user.resetPasswordToken = undefined

        await user.save()

        res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        }) 
    }
}

exports.registerUser = async(req,res,next)=>{
    try {

        const {name,email,password} = req.body;
        const hashed_password = await hashPassword(password)
        const user = await User.create({name,email,password:hashed_password,avatar:{
            public_id:"randome id",
            url:"random url"
        }})

        const token = await createToken(user._id)

        return res.status(201).cookie("token",token,{
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000),
            httpOnly:true
        }).json({
            success:true,
            user,
            token
        })
        
    } catch (error) {
        console.log(error.message);
        if(error.code == 11000){
            return res.status(500).json({
                success:false,
                message:"Email already registered"
            })
        }
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.loginUser = async(req,res,next) =>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(401).json({
                success:false,
                message:"Please enter email and password"
            })
        }

        const user = await User.findOne({email}).select("+password")

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Invalid email"
            })
        }

        if( await comparePassword(password,user.password)){

            const token = await createToken(user._id)

            return res.status(201).cookie("token",token,{
                expires: new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000),
                httpOnly:true
            }).json({
                success:true,
                user,
                token
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"Invalid password"
            })
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.logout = async(req,res,next)=>{
    try {
        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true
        })

        return res.status(201).json({
            success:true,
            message:"Logged Out"
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        }) 
    }
}

exports.getUserDetails = async(req,res,next)=>{
    try {
        const user =await User.findById(req.user._id)

        return res.status(201).json({
            success:true,
            user
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.updatePassword = async(req,res,next)=>{
    try {
        const user =await User.findById(req.user._id).select("+password")
        const isPasswordMatched = await comparePassword(req.body.oldPassword,user.password)

        if(!isPasswordMatched){
            return res.status(400).json({
                success:false,
                message:"Old password is incorrect"
            })
        }

        if(req.body.newPassword !== req.body.confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password dosen't match"
            })
        }

        user.password = await hashPassword(req.body.newPassword)

        await user.save();

        return res.status(201).json({
            success:true,
            message:"Password updated successfully"
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.updateProfile = async(req,res,next)=>{
    try {
        
        await User.findByIdAndUpdate(req.user._id,req.body)

        return res.status(201).json({
            success:true,
            message:"Profile updated successfully"
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// All user users (Admin)
exports.getAllUser = async(req,res,next)=>{
    try {    
        const users = await User.find()

        return res.status(201).json({
            success:true,
            users
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// Single user (Admin)
exports.getSingleUser = async(req,res,next)=>{
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(500).json({
                success:false,
                message:"Invalid user id"
            })
        }

        const user = await User.findById(req.params.id)

        if(!user){
            return res.status(500).json({
                success:false,
                message:"User not found"
            })
        }

        return res.status(201).json({
            success:true,
            user
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// admin user update
exports.updateUserRole = async(req,res,next)=>{
    try {

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(500).json({
                success:false,
                message:"Invalid user id"
            })
        }
        
        const user = await User.findByIdAndUpdate(req.params.id,req.body)

        if(!user){
            return res.status(500).json({
                success:false,
                message:"User not found"
            })
        }

        return res.status(201).json({
            success:true,
            message:"User updated successfully"
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// Delete user -- admin
exports.deleteUser = async(req,res,next)=>{
    try {

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(500).json({
                success:false,
                message:"Invalid user id"
            })
        }
        
        const user = await User.findByIdAndDelete(req.params.id)

        if(!user){
            return res.status(500).json({
                success:false,
                message:"User not found"
            })
        }

        return res.status(201).json({
            success:true,
            message:"User deleted successfully"
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

