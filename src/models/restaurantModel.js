const mongoose = require("mongoose");
const AddresSchema = require("./addressModel");
const { listIndexes } = require("./userModel");
const restaurentSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    maxLength: 20,
  },
  Description: {
    type: String,
    required: true,
    maxLength: 350,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ImageURL: {
    type: URL,
  },
  addresses: [AddresSchema],
  Cusine: {
    type: [String],
    default: [],
    maxLength: 20,
  },
  rating: {
    type: String,
  },
  status: {
    type: String,
    enum: {
      values: ["open", "closed"],
      message: "Invalid input for status.",
    },
  },
});

((moduke.export = mongoose), model("Restaurents", restaurentSchema));
