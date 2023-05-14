const { default: mongoose } = require("mongoose");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

exports.newOrder = async (req, res, next) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user._id,
        });

        res.status(201).json({
            success: true,
            order,
        });

    } catch (error) {
        console.log(error.message);
        req.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSingleOrdr = async (req, res, next) => {
    try {

    } catch (error) {
        console.log(error.message);
        req.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSingleOrder = async (req, res, next) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(500).json({
                success: false,
                message: "Invalid Order Id"
            })
        }

        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this Id",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        console.log(error.message);
        req.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.myOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })

        res.status(200).json({
            success: true,
            orders,
        });

    } catch (error) {
        console.log(error.message);
        req.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()

        let totalAmount = 0;

        orders.forEach((order) => {
            totalAmount += order.totalPrice;
        })

        res.status(200).json({
            success: true,
            orders,
            totalAmount
        });

    } catch (error) {
        console.log(error.message);
        req.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateOrder = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(500).json({
                success: false,
                message: "Invalid Order Id"
            })
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this Id"
            })
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "You have already delivered this order"
            })
        }

        if ((req.body.status === "Shipped") || (req.body.status === "Delivered" && order.orderStatus === "Processing")) {
            order.orderItems.forEach(async (o) => {
                await updateStock(o.product, o.quantity);
            });
        }
        order.orderStatus = req.body.status;

        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
        }

        await order.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
        });


    } catch (error) {
        console.log(error.message);
        req.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    let qty = product.Stock - quantity
    await Product.findByIdAndUpdate(id, { Stock: qty });
}

exports.deleteOrder = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(500).json({
                success: false,
                message: "Invalid Order Id"
            })
        }

        const order = await Order.findByIdAndRemove(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this Id"
            })
        }

        res.status(200).json({
            success: true,
        });


    } catch (error) {
        console.log(error.message);
        req.status(500).json({
            success: false,
            message: error.message
        })
    }
}

