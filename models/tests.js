const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TestSchema = new Schema({
    createdBy:{
        //the users id will be stored here
        type: String,
        required:true
    },
    name:{
        type: String,
        required: true
    },
    repeatable:{
        type: Boolean,
        required: true
    },
    commentable:{
        type: Boolean,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    numOfQuestions:{
        type: String,
        required: false
    },
    categorie:{
        type: String,
        required: true
    },
    questions:[{
        question: {
            type:String,
            required: false
        },
        yes:{
            type:Number, 
            default: 0
        },
        no:{
            type:Number, 
            default: 0
        },
        neutral:{
            type:Number, 
            default: 0
        }
     
    }],
    takenBy:[{
        takenBy:{
            type:String,
            required:true
        },
        answers:[{
            type:String,
            required: true
        }],
        date: {
            type: Date,
            default: Date.now
        },

        required: false
    }],
    comments:[{
        writtenBy: {
            type:String,
            required: true
        },
        title:{
            type:String,
            required: true
        },
        text:{
            type:String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
       
    }],
    required: false

});

mongoose.model('tests', TestSchema)