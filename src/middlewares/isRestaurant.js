
const mongoose = require("mongoose");
const Restaurants = require("../models/restaurantModel");
const { handleError } = require("../utils/helperfunctions");


const isRestaurant = async (req, res,next ) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid restaurant ID format",
      });
    }

    const restaurant = await Restaurants.findById(req.params.id)

    if (!restaurant) {
       return res.status(404).json({
        message: "Restaurant not found",
      });}
      req.restaurant = restaurant;
      next()
    }catch (err) {
    return handleError(res, err);
  }
};
module.exports = isRestaurant