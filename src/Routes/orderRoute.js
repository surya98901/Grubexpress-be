const express = require("express");
const userAuth = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/api/user/order", userAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    return res.status(200).json({
      message: "orders",
      Data: orders,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.get("/api/user/order/:orderId", userAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({
        message: "Invalid order ID format",
      });
    }
    const orders = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    });
    if (!orders) {
      return res.status(404).json({
        message: "No order list empty order",
      });
    }
    return res.status(200).json({
      message: "orders",
      Data: orders,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.post("/api/user/order", userAuth, async (req, res) => {
  try {
    const cartDetails = await Cart.findOne({ userId: req.user._id });
    if (!cartDetails || cartDetails.items.length === 0) {
      return res.status(400).json({ message: "Cart is already empty" });
    }
    const { discount, coupon } = req.query;
    const addressIndex = req.user.addresses.findIndex(
      (i) => i.isDefault === true,
    );

    const deliveryFee = cartDetails.total >= 1000 ? 0 : 35;

    const order = new Order({
      userId: req.user._id,
      restaurantId: cartDetails.restaurantId,
      items: cartDetails.items,
      address: req.user.addresses[addressIndex],
      discount: discount,
      deliveryFee: deliveryFee,
      orderStatus: "PLACED",
    });

    await order.save();
    await Cart.deleteOne({
      userId: req.user._id,
    });
    return res.status(201).json({
      message: "orders",
      Data: order,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.patch("/api/user/order/:orderId/cancel", userAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({
        message: "Invalid order ID format",
      });
    }
    const orders = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    });
    if (!orders) {
      return res.status(404).json({
        message: "No order list empty order",
      });
    }
    if (orders.orderStatus === "CANCELLED") {
      return res.status(200).json({
        message: "order is already cancelled",
      });
    }
    if (!["PLACED", "CONFIRMED"].includes(orders.orderStatus)) {
      return res.status(200).json({
        message: "cannot cancel the order",
      });
    }
    orders.orderStatus = "CANCELLED";
    await orders.save();
    return res.status(201).json({
      message: "order cancelled",
    });
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
