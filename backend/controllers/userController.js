const User = require('../models/userModel')
const bcrypt =require('bcryptjs')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

const hashPassword = async (password) =>{
    return await bcrypt.hash(password,10)
}

const comparePassword = async (password,hashed) =>{
    return await bcrypt.compare(password,hashed)
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
        const resetPasswordExpire = Date.now()+15*60*1000

        user = await User.findByIdAndUpdate(user._id,{resetPasswordToken,resetPasswordExpire})

        const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

        const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then please ignore it 28`

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
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.resetPassword = async(req,res,next)=>{
    try {
        console.log(req.params.token);
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
        console.log(resetPasswordToken);
        const user = await User.findOne({resetPasswordToken})

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

        user.password = req.body.password;
        user.resetPasswordExpire = undefined
        user.resetPasswordToken = undefined

        await user.save()

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

        res.status(201).json({
            success:true,
            user
        })
        
    } catch (error) {
        console.log(error.message);
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
            req.session.user = user;
            return res.status(201).json({
                success:true,
                message:"Logged In"
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
        req.session.destroy();
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