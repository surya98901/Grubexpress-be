const express = require("express");
const { handleError } = require("../utils/helperfunctions");
const FoodItem = require("../models/FoodItem")

const router = express.Router();

router.get("/api/itemsList", async(req, res)=>{
    try{
        const list  = await FoodItem.find({});
        return res.json({list})
       
    }catch(err){
        return handleError(res, err)
    }
});
router.post("/api/itemsList", async(req, res)=>{
    try{
        const {name, image} = req.body;

        const item = new FoodItem({
            title:name,
            ImageURL: image,
        });
        await item.save()
        
        return res.json({item})
       
    }catch(err){
        return handleError(res, err)
    }
});
module.exports = router;