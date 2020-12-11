const mongoose =require('mongoose');

const userScehema = mongoose.Schema({
    "loggedInUserId": String,
    "email": String,
    "name": String,
    "imageURL": String
});


module.exports =  mongoose.model('user', userScehema);