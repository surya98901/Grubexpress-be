
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
  "name",
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
module.exports = {userAllowedFields,restaurentsAllowedFields, menuAllowedEditFields,orderAllowedEditFields}