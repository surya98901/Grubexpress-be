const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "EXPIRED", "REFUNDED"],
      default: "PENDING",
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    paidAt: {
      type: Date,
    },

    paymentProvider: {
      type: String,
    },

    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({
  paymentStatus: 1,
  expiresAt: 1,
});

module.exports = mongoose.model("Payment", paymentSchema);