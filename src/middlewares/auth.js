const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { isValidObjectId } = require('../utils/validations');

const extractToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }
  return null;
};

const userAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw new Error("invalid token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded._id || !isValidObjectId(decoded._id)) {
      throw new Error("invalid token payload");
    }
    const user = await User.findOne({ _id: decoded._id });
    if (!user) throw new Error("user not found");
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw new Error("invalid token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded._id || !isValidObjectId(decoded._id)) {
      throw new Error("invalid token payload");
    }
    const user = await User.findOne({ _id: decoded._id });
    if (!user || user.role !== "admin") throw new Error("user not found or not an admin");
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate bot.' });
  }
};

module.exports = { userAuth, adminAuth };
