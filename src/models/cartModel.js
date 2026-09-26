const mongoose = require("mongoose");
const Items = require("./itemModel")

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique:true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurants",
      required: true,
    },
    items: [Items],
    total:{
      type:Number,
      default:0,
      min: 0,
    }
  },
  {
    timestamps: true,
  },
);
cartSchema.pre("save", function () {
  if (this.isModified("items")) {
    this.total = this.items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  }

});
module.exports = mongoose.model("Cart", cartSchema);
