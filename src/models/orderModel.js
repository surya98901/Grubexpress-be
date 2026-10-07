const mongoose = require("mongoose");
const Items = require("./itemModel");
const Payment = require("./paymentModel")
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
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
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
},{
    timestamps: true,
  },);
orderSchema.pre("save", function () {
  if (this.isModified("items")) {
    this.subTotal = this.items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  }
  this.tax = Math.ceil(this.subTotal * 0.05);
  this.totalAmount = this.subTotal + this.tax - this.discount +this.deliveryFee
});
orderSchema.index({
  userId: 1,
  createdAt: -1,
});

orderSchema.index({
  restaurantId: 1,
  orderStatus: 1,
});
module.exports = mongoose.model("Order", orderSchema);
