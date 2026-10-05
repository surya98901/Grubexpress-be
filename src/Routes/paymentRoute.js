const express = require("express");
const {userAuth} = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");
const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");
const {
  paymentAllowedStatusFields,
  allowedPaymentTransitions,
} = require("../utils/constants");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/api/payment/:orderId", userAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({
        message: "Invalid order ID format",
      });
    }
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      userId: req.user._id,
    });
    if (!payment) {
      return res.status(404).json({
        message: "failed to fetch paymentfor order",
      });
    }
    return res.status(200).json({
      message: "payment",
      data: payment,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
/*{temp payment conformation created for portfolio purposes only }*/
router.patch("/api/payment/:orderId", userAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID format",
      });
    }

    if (!paymentAllowedStatusFields.includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const payment = await Payment.findOne({
      orderId,
      userId: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Failed to fetch payment for order",
      });
    }

    const allowedNextStatuses =
      allowedPaymentTransitions[payment.paymentStatus];

    if (!allowedNextStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Cannot change payment status from ${payment.paymentStatus} to ${paymentStatus}`,
      });
    }

    payment.paymentStatus = paymentStatus;

    if (paymentStatus === "PAID") {
      payment.paidAt = new Date();
    }

    await payment.save();
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (paymentStatus === "PAID") {
      order.orderStatus = "CONFIRMED";
      await order.save();
    }

    if (paymentStatus === "FAILED") {
      // Leave order PLACED for now
    }

    return res.status(200).json({
      message: "Payment status updated",
      data: payment,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
module.exports = router;