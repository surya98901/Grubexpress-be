const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token ;
    if(!token) throw new Error("invalid token")
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    if(!user) throw new Error("user not found")
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate bot.' });
  }
};
module.exports = userAuth;
