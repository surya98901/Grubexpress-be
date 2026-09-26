
const handleError = (res, err, status = 400) => {
  return res.status(status).json({ message: err.message || "Something went wrong" });
};
const sanitizeUser = (user) => {
  const userData = user.toObject();
  delete userData.password;
  return userData;
};
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    maxAge:  2 * 60 * 60 * 1000 ,
  });
};
module.exports = {handleError,sanitizeUser,setAuthCookie};