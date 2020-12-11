require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pusher = require('pusher');


// data collection imports
const Users = require('./users');
const Rooms = require('./rooms');
const Messages = require('./dbMessages');


// app config
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
    appId: process.env.PUSHER_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: "ap2",
    useTLS: true
});


//middleware
app.use(express.json());
app.use(cors());


// db config
const connection_url = process.env.MONGO_URI;
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.once('open', () => {
    console.log('DB is connected');

    const roomCollection = db.collection("rooms");
    const changeStreamRoom = roomCollection.watch();

    changeStreamRoom.on('change', (change) => {
        // console.log("A change occured", change);

        if (change.operationType === 'insert') {
            const roomDetails = change.fullDocument;
            // console.log(roomDetails);
            pusher.trigger("room", "inserted", {
                _id: roomDetails._id,
                roomName: roomDetails.roomName,
                users: roomDetails.users
            });
        } else if (change.operationType === 'delete') {
            pusher.trigger(
                "room",
                'deleted',
                change.documentKey._id
            );
        } else {
            console.log("Error trigerring Pusher");
        }

    });



    const msgCollection = db.collection("messagecontents");
    const changeStreamMsg = msgCollection.watch();

    changeStreamMsg.on('change', (change) => {
        // console.log("A change occured", change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            // console.log(messageDetails);
            pusher.trigger("messages", "inserted", {
                _id: messageDetails._id,
                roomId: messageDetails.roomId,
                userEmailId: messageDetails.userEmailId,
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                recevied: messageDetails.recevied
            });
        } else {
            console.log("Error trigerring Pusher");
        }
    });


});

// user login and registration

app.get('/users/login', (req, res) => {

    Users.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});


app.post('/users/login', (req, res) => {

    const user = req.body;

    Users.findOne({
        "loggedInUserId": user.loggedInUserId
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            if (!data) {
                Users.create(user, (err, data) => {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.status(200);
                    }
                });
            } else {
                res.status(200);
            }
        }
    })

});


// user sidebar rooms


app.get('/rooms/sync', (req, res) => {

    Rooms.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            // console.log(data);
            res.status(200).send(data);
        }
    });
});

app.post('/rooms/new', (req, res) => {
    const room = req.body;

    Rooms.create(room, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
});

// sidebar chat delete


app.post('/sidebarchat/delete', (req, res) => {

    const roomDelete = req.body;
    // console.log(roomDelete.roomId);

    Rooms.deleteOne({
        _id: roomDelete.roomId,
    }, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            res.status(200)
        }
    })

});


// CHATS

app.get('/messages/sync', (req, res) => {

    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });

});

app.post('/messages/new', (req, res) => {

    const dbMessage = req.body;

    // console.log(dbMessage);

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });
});

// app listen
app.listen(port, () => {
    console.log(`Server started at ${port}`);
})
