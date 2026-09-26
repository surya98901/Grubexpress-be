
const userAllowedFields = [
    "firstName",
    "lastName",
    "userName",
    "phone",
    "addresses"
];
const restaurentsAllowedFields = [
    "Name", "Description", "Cusine", "FSSAIID", "status", "address", "VegOnly", "rating"
]
const menuAllowedEditFields = [
  "title",
  "description",
  "serves",
  "price",
  "cusine",
  "category",
  "type",
  "imageURL",
];
const orderAllowedEditFields = [
          "CONFIRMED",
          "PREPARING",
          "READY",
          "OUT_FOR_DELIVERY",
          "CANCELLED",
        ]
const allowedTransitions = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY"],
  READY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
module.exports = {userAllowedFields,restaurentsAllowedFields, menuAllowedEditFields,orderAllowedEditFields,allowedTransitions}