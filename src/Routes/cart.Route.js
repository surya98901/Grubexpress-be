const express = require("express");
const mongoose = require("mongoose");
const userAuth = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");

const Cart = require("../models/cartModel");
const MenuItem = require("../models/menuItemModel");

const router = express.Router();

router.get("/api/user/cart", userAuth, async (req, res) => {
  try {
    const cartDetails = await Cart.findOne({
      userId: req.user._id,
    });
    if (!cartDetails || cartDetails.items.length === 0) {
      return res.status(200).json({
        message: "Cart is empty",
        data: {
          items: [],
          restaurantId: null,
          total: 0,
        },
      });
    }
    return res.status(200).json({
      message: "Cart fetched successfully",
      data: cartDetails,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/api/user/cart/:itemId", userAuth, async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid item ID format" });
    }

    const item = await MenuItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (!item.available) {
      return res
        .status(404)
        .json({ message: "The item is currently unavailable" });
    }

    let cartDetails = await Cart.findOne({ userId: req.user._id });

    if (!cartDetails) {
      cartDetails = new Cart({
        userId: req.user._id,
        restaurantId: item.restaurantId,
        items: [],
      });
    }

    if (
      cartDetails.restaurantId &&
      cartDetails.restaurantId.toString() !== item.restaurantId.toString()
    ) {
      return res.status(400).json({
        message: "Cannot add items from different restaurants to the same cart",
      });
    }

    const itemIndex = cartDetails.items.findIndex(
      (i) => i.menuItemId.toString() === itemId,
    );
    if (itemIndex > -1) {
      cartDetails.items[itemIndex].quantity += 1;
      cartDetails.items[itemIndex].subTotal +=
        cartDetails.items[itemIndex].price;
    } else {
      cartDetails.items.push({
        menuItemId: itemId,
        quantity: 1,
        subTotal: item.price,
        price: item.price,
        title: item.title,
        imageURL: item.imageURL,
        type: item.type,
      });
    }

    await cartDetails.save();

    return res.status(200).json({
      message: "Item added to cart successfully",
      data: cartDetails,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.patch("/api/user/cart/:itemId", userAuth, async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid item ID format" });
    }

    const cartDetails = await Cart.findOne({ userId: req.user._id });
    if (!cartDetails || cartDetails.items.length === 0) {
      return res.status(400).json({ message: "Cart is already empty" });
    }

    const itemIndex = cartDetails.items.findIndex(
      (i) => i.menuItemId.toString() === itemId,
    );

    if (itemIndex === -1) {
      return res
        .status(400)
        .json({ message: "Item does not exist in the cart" });
    }

    if (cartDetails.items[itemIndex].quantity > 1) {
      cartDetails.items[itemIndex].quantity -= 1;
      cartDetails.items[itemIndex].subTotal -=
        cartDetails.items[itemIndex].price;
    } else {
      cartDetails.items.splice(itemIndex, 1);
    }

    if (cartDetails.items.length === 0) {
      await cartDetails.deleteOne();
      return res.status(200).json({
        message: "Last item removed; cart is now empty",
        data: {
          items: [],
          restaurantId: null,
          total: 0,
        },
      });
    }

    await cartDetails.save();

    return res.status(200).json({
      message: "Cart updated successfully",
      data: cartDetails,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/api/user/cart", userAuth, async (req, res) => {
  try {
    const cartDetails = await Cart.findOne({ userId: req.user._id });
    if (!cartDetails) {
      return res
        .status(400)
        .json({ message: "Cart not found or already empty" });
    }

    await cartDetails.deleteOne();

    return res.status(200).json({
      message: "Cart deleted successfully",
    });
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
