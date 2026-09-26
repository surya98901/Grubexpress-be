const mongoose = require("mongoose");
/*{snap shot of item orderd by user}*/
const itemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  subTotal: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  type: {
    type: String,
    enum: {
      values: ["veg", "non-veg", "has-egg"],
      message: "Invalid input for status.",
    },
  },
  imageURL: {
      type: String,
      default: "ancdligbfdlvkbfli",
    },
});

module.exports = itemSchema;
