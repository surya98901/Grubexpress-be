const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");

const expirePaymentAndCancelOrder = async (orderId) => {
  const payment = await Payment.findOneAndUpdate(
    {
      orderId,
      paymentStatus: "PENDING",
      expiresAt: { $lte: new Date() },
    },
    {
      $set: { paymentStatus: "EXPIRED" },
    },
    { returnDocument: "after" }
  );

  if (!payment) return;

  await Order.findOneAndUpdate(
    {
      _id: payment.orderId,
      orderStatus: "PLACED",
    },
    {
      $set: { orderStatus: "CANCELLED" },
    }
  );
};

module.exports = { expirePaymentAndCancelOrder };