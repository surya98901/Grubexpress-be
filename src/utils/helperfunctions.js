const handleError = (res, err, status = 400) => {
  return res.status(status).json({ message: err.message || "Something went wrong" });
};
module.exports = {handleError};