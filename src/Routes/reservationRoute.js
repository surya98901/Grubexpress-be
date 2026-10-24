const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");
const Reservation = require("../models/reservationModel");
const Restaurants = require("../models/restaurantModel");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/api/user/reservation", userAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id });
    return res.status(200).json({
      message: "reservations",
      data: reservations,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/api/user/reservation", userAuth, async (req, res) => {
  try {
    const { restaurantId, headCount, time, date } = req.body;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        error: "Invalid restaurant ID format",
      });
    }

    const restaurant = await Restaurants.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }
    const reservation = new Reservation({
      userId: req.user._id,
      restaurantId: restaurantId,
      headCount: headCount,
      time: time,
      date: date,
    });
    await reservation.save();

    return res.status(201).json({
      message: "reservation",
      data: {
        reservation,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/api/user/reservation/:reservationId", userAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.reservationId)) {
      return res.status(400).json({
        message: "Invalid reservation ID format",
      });
    }
    const reservation = await Reservation.findOne({
      _id: req.params.reservationId,
      userId: req.user._id,
    });
    if (!reservation) {
      return res.status(404).json({
        message: "No reservation list empty reservation",
      });
    }
    return res.status(200).json({
      message: "reservation",
      data: reservation,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.patch("/api/user/reservation/:reservationId/cancel", userAuth, async (req, res) => {
  try {
     if (!mongoose.Types.ObjectId.isValid(req.params.reservationId)) {
      return res.status(400).json({
        message: "Invalid reservation ID format",
      });
    }
    const reservation = await Reservation.findOne({
      _id: req.params.reservationId,
      userId: req.user._id,
    });
    if (!reservation) {
      return res.status(404).json({
        message: "No reservation list empty reservation",
      });
    }
    if (reservation.status === "CANCELLED") {
      return res.status(200).json({
        message: "order is already cancelled",
      });
    }
    if (!["PLACED", "CONFIRMED", "RESERVED"].includes(reservation.status)) {
      return res.status(200).json({
        message: "cannot cancel the reservation",
      });
    }
    reservation.status = "CANCELLED";
    await reservation.save();
    return res.status(200).json({
      message: "reservation cancelled",
    });
  } catch (err) {
    return handleError(res, err);
  }
});
module.exports = router;
