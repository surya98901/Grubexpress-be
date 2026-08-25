const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurants",
  },
  name: {
    type: String,
    requireed: true,
  },
  description: {
    type: String,
    required: true,
    maxLength: 350,
  },
  imageURL: {
    type: String,
    default: "ancdligbfdlvkbfli",
  },
  serves: {
    type: Number,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  category: {
    type: String,
    required: true,
  },
  cusine: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: {
      values: ["veg", "non-veg", "has-egg"],
      message: "Invalid input for status.",
    },
  },
  available: { type: Boolean, default: true },
});
module.exports = mongoose.model("MenuItem", menuItemSchema);
