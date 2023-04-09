exports.isUserAuthenticated = (req,res,next)=>{
    if(req.session.user){
       next();
    }else{
        return res.status(401).json({
            success:false,
            message:"Please login to view the page"
        })
    }
}

exports.authorizeRoles = (req,res,next)=>{
    const role = req.session.user.role;
    if(role=="admin"){
        next();
    }else{
        return res.status(403).json({
            success:false,
            message:`Role ${role} is not allowed to use this resource`
        })
    }
}