const express = require("express");
const  mongoose = require("mongoose");
const Restaurents = require("../models/restaurantModel");
const userAuth = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");
const { restaurentsAllowedFields } = require("../utils/constants");
const router = express.Router();


router.get("/api/restaurents", userAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const skip = (page - 1) * limit;
    const {cusine, minRating} = req.query

    const filter = {
        status: "open",
    }
    if(cusine){
        filter.Cusine  = {$regex: new RegExp(cusine.trim(), "i")};
    }
    if(minRating && !isNaN(minRating)){
        filter.rating = { $gte: Number(minRating) };
    }
    const totalRestaurants = await Restaurents.countDocuments(filter);
    const restaurentsList = await Restaurents.find(filter)
      .select(restaurentsAllowedFields)
      .skip(skip)
      .limit(limit);
  

    return res.status(200).json({
      message: "Recommendations fetched successfully",
      data: restaurentsList,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRestaurants / limit),
        openItems: restaurentsList.length,
        totalItems: totalRestaurants,
        limit,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.post("/api/restaurents/create", userAuth, async (req, res) => {
  try {
    const { Name, Description, Cusine, FSSAIID, status, address } = req.body;
    if (req.user.role != "admin") {
      throw new Error("please login as a restaurent admin");
    }
    const updateFeilds = Object.keys(req.body).every((item) =>
      restaurentsAllowedFields.includes(item),
    );

    if (!updateFeilds) {
      throw new Error("invalid feild");
    }

    const restaurent = new Restaurents({
      Name,
      Description,
      Cusine,
      FSSAIID,
      status,
      address,
      AdminId: req.user._id,
    });
    await restaurent.save();
    return res.status(201).json({
      message: `${req.user.firstName}, you have succesfully created your restaurent.`,
      Data: restaurent,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.get("/api/restaurents/:id", userAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const restaurent = await Restaurents.findById(req.params.id).select(
      restaurentsAllowedFields,
    );
    if (!restaurent) {
      return res.status(404).json({ error: "nope no restaurent with that id" });
    }
    return res.status(200).json({
      message: `${req.user.firstName}, the restaurent details `,
      Data: restaurent,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.patch("/api/restaurents/:id/edit", userAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const restaurent = await Restaurents.findById(req.params.id);
    const data = req.body;
    if (!restaurent) {
      return res.status(404).json({ error: "nope no restaurent with that id" });
    }

    if (restaurent.AdminId.toString() != req.user._id.toString()) {
      throw new Error("bro u are not authorized, plz sign as admin");
    }
    const updateFeilds = Object.keys(req.body).every(
      (item) => restaurentsAllowedFields.includes(item) && item != "status",
    );

    if (!updateFeilds) {
      throw new Error("invalid feild");
    }
    Object.keys(data).forEach((item) => {
      restaurent[item] = data[item];
    });
    await restaurent.save();
    return res.status(200).json({
      message: `${req.user.firstName}, your restaurent has been updated successfully`,
      data: restaurent,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.patch("/api/restaurents/:id/status", userAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const setStatus = req.body.status;
    const restaurent = await Restaurents.findById(req.params.id);
    if (!restaurent) {
      return res.status(404).json({ error: "nope no restaurent with that id" });
    }

    if (restaurent.AdminId.toString() != req.user._id.toString()) {
      throw new Error("bro u are not authorized, plz sign as admin");
    }
    if (!["open", "close"].includes(setStatus)) {
      throw new Error("Invalid status it can be either open or close");
    }
    if (restaurent.status.toLowerCase() === setStatus.toLowerCase()) {
      return res.status(200).json({
        message: `${req.user.firstName}, your restaurent has been ${setStatus}ed already`,
        data: restaurent.status,
      });
    }
    restaurent.status = setStatus;
    await restaurent.save();

    return res.status(200).json({
      message: `${req.user.firstName}, your restaurent has been ${setStatus}ed successfully`,
      data: restaurent.status,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.patch("/api/restaurents/:id/active", userAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const status = req.body.Active;
    if (typeof status !== "boolean") {
  throw new Error("active must be boolean");
}
    const restaurent = await Restaurents.findById(req.params.id);
    if (!restaurent) {
      return res.status(404).json({ error: "nope no restaurent with that id" });
    }

    if (restaurent.AdminId.toString() != req.user._id.toString()) {
      throw new Error("bro u are not authorized, plz sign as admin");
    }

    if (restaurent.Active && restaurent.Active === status) {
      return res.status(200).json({
        message: `${req.user.firstName}, your restaurent has been ${status}ed already`,
        data: restaurent.Active,
      });
    }
    restaurent.Active = status;
    if (restaurent.Active === false) {
      restaurent.status = "close";
    }
    await restaurent.save();

    return res.status(200).json({
      message: `${req.user.firstName}, your restaurent Active status has been changed successfully`,
      data: restaurent.Active,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
module.exports = router;
