const mongoose = require("mongoose");
const Items = require("./itemModel");
const AddresSchema = require("./addressModel");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurants",
    required: true,
  },
  items: [Items],
  address: AddresSchema,
  subTotal: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  deliveryFee: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  paymentStatus: {
  type: String,
  enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
  default: "PENDING",
},
  orderStatus: {
    type: String,
    enum: {
      values: [
        "PLACED",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      message: "Invalid input for status.",
    },
    default: "PLACED",
  },
});
orderSchema.pre("save", function () {
  if (this.isModified("items")) {
    this.subTotal = this.items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  }
  this.tax = this.subTotal * 0.05;
  this.totalAmount = this.subTotal + this.tax - this.discount +this.deliveryFee
});
module.exports = mongoose.model("Order", orderSchema);
