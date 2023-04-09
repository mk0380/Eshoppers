const Product = require('../models/productModel')
const mongoose =require('mongoose')
// const ApiFeatures = require('../utils/apifeatures')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')

exports.createProduct = async(req,res,next)=>{

    try {
        req.body.user = req.session.user._id
        const product = await Product.create(req.body);
        res.status(201).json({
            success:true,
            product
        })  
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }   
}

exports.getAllProducts = async(req,res)=>{

    try {

        const productCount = await Product.countDocuments();

        let products =  req.query.keyword? await Product.find({"name":{$regex:".*"+req.query.keyword+".*",$options:"i"}}): await Product.find()

        products = req.query.category ? products.filter((prod)=>prod.category===req.query.category):products

        products = req.query.price ? products.filter((prod)=>prod.price<=(req.query.price.lt) && prod.price>=(req.query.price.gt)):products    
        
        const page = req.query.page || 1;
        const limit = req.query.limit || 3;
        const start = (page-1)*limit;
        const end = start + limit-1;

        products = products.filter((_,index)=> index>=start && index<=end)

        res.status(200).json({
            success:true,
            products,
            productCount
        }) 
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getProductDetails = async(req,res,next)=>{
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(500).json({
                success:false,
                message:"Product not found"
            })
        }

        const product = await Product.findById(req.params.id)

        if(!product){
            return res.status(500).json({
                success:false,
                message:"Product not found"
            })
        }

            res.status(200).json({
                success:true,
                product
            }) 
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    } 
}

exports.updateProduct = async(req,res,next)=>{

    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(500).json({
                success:false,
                message:"Product not found"
            })
        }
    
        let product =await Product.findById(req.params.id)

        if(!product){
            return res.status(500).json({
                success:false,
                message:"Product not found"
            })
        }
    
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
    
        res.status(200).json({
            success:true,
            product
        })  
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.deleteProduct = async(req,res,next)=>{

    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(500).json({
                success:false,
                message:"Product not found"
            })
        }
    
        const product = await Product.findById(req.params.id)

        if(!product){
            return res.status(500).json({
                success:false,
                message:"Product not found"
            })
        }
    
        await Product.deleteOne(product)
    
            res.status(200).json({
                success:true,
                message:"Product Deleted Successfully"
            })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}