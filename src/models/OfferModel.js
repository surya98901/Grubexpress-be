const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxLength: 150,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxLength: 20,
    },

    type: {
      type: String,
      enum: ["percentage", "flat", "free_delivery"],
      required: true,
    },

    discountValue: {
      type: Number,
      min: 0,
      required: function () {
        return this.type !== "free_delivery";
      },
    },

    maxDiscount: {
      type: Number,
      min: 0,
      default: null,
    },

    minOrderValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      min: 1,
      default: null,
    },

    usedCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentMethods: {
      type: [String],
      enum: [
        "upi",
        "credit_card",
        "debit_card",
        "net_banking",
        "wallet",
        "cash_on_delivery",
      ],
      default: [],
    },
    offerProvider: {
      type: {
        type: String,
        enum: ["restaurant", "platform", "bank", "payment_provider", "brand"],
        required: true,
      },

      provider: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Offer",OfferSchema);
