const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AddresSchema = require("./addressModel")


const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required :true,
      maxLength: 20,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      maxLength: 20,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      maxLength: 60,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
  
    },
    phone: {
      type: String,
      maxLength: 15,
    },
    addresses: [ AddresSchema ],
    role: {
      type: String,
      enum: ["customer", "admin", "delivery_partner"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  },
);
userSchema.methods.getJWT = async function() {
    const token = await jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "2h"
    });
    return token;
};
userSchema.methods.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
}
module.exports = mongoose.model("User", userSchema);
