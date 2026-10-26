
const Payment = require("../models/paymentModel");
const { expirePaymentAndCancelOrder } = require("../services/paymentExpiryService");
const mongoose = require("mongoose");

const getPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    // Check expiry and cancel the order if necessary
    await expirePaymentAndCancelOrder(orderId);

    // Fetch the latest payment after expiry processing
    const updatedPayment = await Payment.findOne({
      orderId,
      userId: req.user._id,
    });

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Get payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
    });
  }
};

module.exports = { getPayment };
