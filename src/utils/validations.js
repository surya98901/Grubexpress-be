const validator = require("validator");

const validateData = (req)=>{
    try{
        const { firstName, lastName, phone, emailId, password } = req.body;
        if(firstName && !validator.isAlpha(firstName.replace(/\s/g, ''))){
            throw new Error("First name should only contain alphabets and spaces");
        }if(lastName && !validator.isAlpha(lastName)){
            throw new Error("Last name should only contain alphabets");
        }
        if(phone && !validator.isMobilePhone(phone)){
            throw new Error("Invalid phone number format");
        }
        if(emailId && !validator.isEmail(emailId)){
            throw new Error("Invalid email format");
        }if(password && !validator.isStrongPassword(password, { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })){
            throw new Error("Password must be between 6 and 20 characters and include at least one lowercase letter, one uppercase letter, and one number");
        }
    }catch(err){
        throw new Error(err.message);
    }
}
module.exports = { validateData };