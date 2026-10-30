
const userAllowedFields = [
  "firstName",
  "lastName",
  "userName",
  "phone",
  "addresses",
];

const addressAllowedFields = [
  "label",
  "addressLine",
  "city",
  "state",
  "pincode",
  "latitude",
  "longitude",
  "isDefault",
];

const restaurantsAllowedFields = [
  "Name",
  "Description",
  "Cusine",
  "FSSAIID",
  "status",
  "address",
  "VegOnly",
  "rating",
  "imageURL"
];

// Keep restaurentsAllowedFields for backwards compatibility
const restaurentsAllowedFields = restaurantsAllowedFields;

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
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const allowedTransitions = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY"],
  READY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const reservationAllowedStatuses = [
  "PLACED",
  "CONFIRMED",
  "RESERVED",
  "CANCELLED",
];

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

module.exports = {
  userAllowedFields,
  addressAllowedFields,
  restaurantsAllowedFields,
  restaurentsAllowedFields,
  menuAllowedEditFields,
  orderAllowedStatuses,
  allowedTransitions,
  reservationAllowedStatuses,
  paymentAllowedStatusFields,
  allowedPaymentTransitions,
};
