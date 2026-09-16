
const mongoose = require("mongoose");
/*{tosearch a food item}*/
const FoodItemSchema  = new mongoose({
    title : {
        type : String,
        required : true,
    },
    ImageURL : {
        type: String,
        required : true,
    },
});

module.exports = mongoose.model("FoodItem", FoodItemSchema);