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
  AdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  address: AddresSchema,
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
      values: ["open", "close"],
      message: "Invalid input for status.",
    },
  },
  FSSAIID:{
    type:String,
    required: true,
  },
  VegOnly: { type: Boolean, default: false },
  Active : { type: Boolean, default: true },
});

module.exports = mongoose.model("Restaurents", restaurentSchema);
