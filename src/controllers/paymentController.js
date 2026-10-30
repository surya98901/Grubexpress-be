
const Payment = require("../models/paymentModel");
const { expirePaymentAndCancelOrder } = require("../services/paymentExpiryService");
const { isValidObjectId } = require("../utils/validations");

const getPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    await expirePaymentAndCancelOrder(orderId);
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
