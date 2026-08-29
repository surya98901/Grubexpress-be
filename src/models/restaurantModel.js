const mongoose = require("mongoose");
const AddresSchema = require("./addressModel");
const restaurantSchema = new mongoose.Schema({
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
    type: Number,
    default:0,
    min :0,
    max:5,
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
  vegOnly: { type: Boolean, default: false },
  Active : { type: Boolean, default: true },
  AdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
  },
},{
    timestamps: true,
  },);

module.exports = mongoose.model("Restaurants", restaurantSchema);
