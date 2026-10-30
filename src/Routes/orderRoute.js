const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Payment = require("../models/paymentModel");
const MenuItem = require("../models/menuItemModel");
const Restaurants = require("../models/restaurantModel");
const { isValidObjectId } = require("../utils/validations");

const router = express.Router();

router.get("/api/user/order", userAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      message: "orders",
      data: orders,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/api/user/order/:orderId", userAuth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.orderId)) {
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
      data: orders,
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

    if (!req.user.addresses || req.user.addresses.length === 0) {
      return res.status(400).json({
        message: "Please add a delivery address before placing an order",
      });
    }

    let selectedAddress;
    if (req.body && req.body.addressId) {
      if (!isValidObjectId(req.body.addressId)) {
        return res.status(400).json({ message: "Invalid address ID format" });
      }
      selectedAddress = req.user.addresses.id(req.body.addressId);
      if (!selectedAddress) {
        return res.status(404).json({ message: "Selected delivery address not found" });
      }
    } else {
      const defaultAddr = req.user.addresses.find((i) => i.isDefault === true);
      selectedAddress = defaultAddr || req.user.addresses[0];
    }

    const restaurant = await Restaurants.findById(cartDetails.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant no longer exists" });
    }
    if (restaurant.status === "close") {
      return res.status(400).json({ message: "Restaurant is currently closed" });
    }

    // Verify all cart items are still available
    const itemIds = cartDetails.items.map((i) => i.menuItemId);
    const availableItems = await MenuItem.find({
      _id: { $in: itemIds },
      available: true,
    });

    if (availableItems.length !== cartDetails.items.length) {
      return res.status(400).json({
        message: "One or more items in your cart are currently unavailable",
      });
    }

    const discount = 0;
    const deliveryFee = cartDetails.total >= 1000 ? 10 : 35;
    const order = new Order({
      userId: req.user._id,
      restaurantId: cartDetails.restaurantId,
      items: cartDetails.items,
      address: selectedAddress,
      discount,
      deliveryFee: deliveryFee,
      orderStatus: "PLACED",
    });
    await order.save();

    const payment = new Payment({
      orderId: order._id,
      userId: req.user._id,
      amount: order.totalAmount,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    order.paymentId = payment._id;
    await order.save();

    await payment.save();
    await Cart.deleteOne({
      userId: req.user._id,
    });

    return res.status(201).json({
      message: "orders",
      data: {
        order,
        payment,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.patch("/api/user/order/:orderId/cancel", userAuth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.orderId)) {
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
    return res.status(200).json({
      message: "order cancelled",
    });
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
