const mongoose = require('mongoose');


var passcateSchema =new mongoose.Schema({
    Password_category: {
        type:String, 
        required: true,
        index: {
            unique: true,        
        }},

    date:{
        type: Date, 
        default: Date.now }
});

var passcateModel = mongoose.model('passcategory', passcateSchema);
module.exports=passcateModel;