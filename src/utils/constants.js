
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
const orderAllowedStatuses = [
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
const paymentAllowedStatusFields = [
  "PAID",
  "FAILED",
  "REFUNDED",
];
const allowedPaymentTransitions = {
  PENDING: ["PAID", "FAILED"],
  PAID: ["REFUNDED"],
  FAILED: ["PENDING"],
  REFUNDED: [],
};
module.exports = {userAllowedFields,restaurentsAllowedFields, menuAllowedEditFields,orderAllowedStatuses,allowedTransitions,paymentAllowedStatusFields,allowedPaymentTransitions}