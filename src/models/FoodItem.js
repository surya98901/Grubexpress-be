
const mongoose = require("mongoose");
/*{tosearch a food item}*/
const FoodItemSchema  = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    ImageURL : {
        type: String,
        default: "/fooditemDefault.png"
    },
});

module.exports = mongoose.model("FoodItem", FoodItemSchema);