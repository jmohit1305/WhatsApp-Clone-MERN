const mongoose = require('mongoose');

const roomScehema = mongoose.Schema({
    "roomName": String,
    "users": []
});


module.exports = mongoose.model('room', roomScehema);