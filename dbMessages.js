const mongoose = require('mongoose');

const whatsappScehema = mongoose.Schema({
    "roomUsers": [],
    "roomId": String,
    "message": String,
    "name": String,
    "userEmailId": String,
    "timestamp": String,
    "recevied": Boolean
});

module.exports = mongoose.model('messageContent', whatsappScehema);