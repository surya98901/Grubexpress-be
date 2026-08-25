
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
module.exports = {userAllowedFields,restaurentsAllowedFields, menuAllowedEditFields}