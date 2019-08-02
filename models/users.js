const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    
    religion:{
        type: String,
        required: true
    },
    
    party:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('users', UserSchema)