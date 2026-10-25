const mongoose = require("mongoose");
const Restaurants = require("../models/restaurantModel");
const { handleError } = require("../utils/helperfunctions");

const reservationSchema = new mongoose.Schema({
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
  headCount: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  time: {
    type: String,
    required: true,
  },
  date:{
    type: String,
    required: true,
  },
  note:{
    type:String,
  },
  status: {
    type: String,
    enum: {
      values: [
        "PLACED",
        "CONFIRMED",
        "RESERVED",
        "CANCELLED",
      ],
      message: "Invalid input for status.",
    },
    default: "PLACED",
  },
},{
    timestamps: true,
  },);
module.exports = mongoose.model("Reservation", reservationSchema);