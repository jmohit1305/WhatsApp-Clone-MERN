import { Avatar, IconButton } from '@material-ui/core';
import { AttachFile, InsertEmoticon, MoreVert, SearchOutlined } from '@material-ui/icons';
import MicIcon from '@material-ui/icons/Mic';
import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';
import { useStateValue } from './StateProvider';
import axios from './axios';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import EmojiPicker, { SKIN_TONE_NEUTRAL } from 'emoji-picker-react';

function Chat({ messages }) {

    const utcDate = new Date();

    const [seed, setSeed] = useState("");
    const [input, setInput] = useState("");
    // eslint-disable-next-line
    const [{ user, roomId }, dispatch] = useStateValue();
    const [room_name, setRoomName] = useState("");
    const [roomUsers, setRoomUsers] = useState([]);
    const [profileURL, setProfileURL] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);

    const onEmojiClick = (event, emojiObject) => {
        setShowEmoji(false);
        setInput(input + emojiObject.emoji)
    };

    const AlwaysScrollToBottom = () => {
        const elementRef = useRef();
        useEffect(() => elementRef.current.scrollIntoView());
        return <div ref={elementRef} />;
    };


    useEffect(() => {
        axios.get("/rooms/sync").then(response => {
            response.data.map(resData => (
                (resData._id === roomId) ? (setRoomName(resData.roomName)) : (null)
            ));
        });

    }, [roomId]);


    useEffect(() => {
        axios.get("/rooms/sync").then(response => {
            response.data.map(resData => (
                (resData._id === roomId) ? (setRoomUsers(resData.users)) : (null)
            ));
        });
    }, [roomId]);

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();


        if (input.length > 0) {
            axios.post('/messages/new', {
                "roomUsers": roomUsers,
                "roomId": roomId,
                "message": input,
                "name": user.name,
                "userEmailId": user.email,
                "timestamp": utcDate.toUTCString(),
                "recevied": "false"
            });
        }

        setInput("");
    }
    // eslint-disable-next-line
    const deleteChat = () => { }

    const timestampFormat = (time) => {
        var ts = new Date(time).toLocaleTimeString();
        return (ts.length === 11 ? (ts.slice(0, 5) + " " + ts.slice(-2)) : (ts.slice(0, 4) + " " + ts.slice(-2)));
    }

    useEffect(() => {

        axios.get('/rooms/sync').then(response => {
            response.data.map(resData => {
                if (resData._id === roomId) {
                    const abc = resData.users.filter(e => e !== user.email)
                    axios.get('/users/login').then(userResponse => {
                        userResponse.data.map(userProfileData => {
                            return (userProfileData.email === abc[0] ? (setProfileURL(userProfileData.imageURL)) : null);
                        });
                    });
                } else {
                    return setProfileURL(`https://avatars.dicebear.com/api/human/${seed}.svg`);
                }
                return 0;
            })
        });

    }, [roomId, seed, user]);

    const emojiPicker = () => {
        if (showEmoji === true) {
            setShowEmoji(false);
        } else {
            setShowEmoji(true);
        }
    }

    return (
        <div className="chat">
            <div className="chat__header">
                <Avatar src={profileURL} />
                <div className="chat__headerInfo">
                    <h3>{room_name}</h3>
                    <p>Last Seen at...</p>
                </div>
                <div className="chat__headerRight">
                    <IconButton>
                        <SearchOutlined />
                    </IconButton>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </div>
            </div>

            <div className="chat__body">
                {
                    messages.map(message => (
                        message.roomId === roomId ? (<div key={message._id} className={`chat__message ${(message.userEmailId === user.email) ? "chat__receiver" : "chat__message"}  `}>
                            <span className="chat__name">{message.name}</span>
                            <div className="chat__text">{message.message}</div>
                            <div className="chat__timestamp">{timestampFormat(message.timestamp)}</div>
                            <span className="chat__delete"><span className="chat__sidebox"></span><DeleteSweepIcon /></span>
                        </div>) : null
                    ))
                }

                {/* {message.message.slice(0, 70) + '\n' + message.message.slice(70)} */}
                <AlwaysScrollToBottom />
                {showEmoji ? (<EmojiPicker onEmojiClick={onEmojiClick} skinTone={SKIN_TONE_NEUTRAL} />) : null}
            </div>
            <div className="chat__footer">
                <IconButton onClick={emojiPicker} >
                    <InsertEmoticon />
                </IconButton>

                <form>
                    <input value={input} placeholder="Type a message" onChange={(e) => {
                        setInput(e.target.value);
                    }}
                    />
                    <button onClick={sendMessage} type="submit" />
                </form>
                <IconButton>
                    <MicIcon />
                </IconButton>
            </div>
        </div>
    )
}

export default Chat;
