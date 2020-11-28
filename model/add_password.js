const mongoose = require('mongoose');


var passSchema =new mongoose.Schema({
    Password_category: {
        type:String, 
        required: true,
        index: {
            unique: true,        
        }},
        
        Password_details: {
            type:String, 
            required: true,
           },

    date:{
        type: Date, 
        default: Date.now }
});

var passModel = mongoose.model('password_details', passSchema);
module.exports=passModel;