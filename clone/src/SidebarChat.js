import { Avatar, IconButton } from '@material-ui/core';
import axios from './axios';
import React, { useEffect, useState } from 'react';
import './SidebarChat.css';
import { useStateValue } from "./StateProvider";
import AddIcon from '@material-ui/icons/Add';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';


function SidebarChat({ id, name, addNewChat, messages }) {

    const [seed, setSeed] = useState("");

    const [{ user }, dispatch] = useStateValue();

    const [profileURL, setProfileURL] = useState("");

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
    }, []);

    const createChat = () => {
        const addUser = prompt("Enter user mail id");
        const newRoomName = prompt("Enter Room Name");

        if (!addUser || !newRoomName) {
            return 0;
        } else {
            axios.post('/rooms/new', {
                "roomName": newRoomName,
                "users": [
                    user.email,
                    addUser
                ]
            });
        }
    };

    const roomIdDispatch = () => {
        dispatch({
            type: "SET_ROOMID",
            roomId: id,
        });
    }

    const deleteChat = () => {

        axios.post('/sidebarchat/delete', {
            roomId: id
        });

        dispatch({
            type: "SET_ROOMID",
            roomId: "",
        });

    }

    var arrayPush = [];
    const messageArray = () => {
        // eslint-disable-next-line
        var abc = messages.map(mesData => {
            return (mesData.roomId === id) === true ? (arrayPush.push(mesData.message)) : (0);
        })

        return (arrayPush[arrayPush.length - 1]);
    }

    const arrayEmpty = () => {
        arrayPush = [];
    }

    useEffect(() => {

        axios.get('/rooms/sync').then(response => {
            response.data.map(resData => {
                if (resData._id === id) {
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
    }, [id, user, seed]);



    return !addNewChat ? (
        // <Link to={`/rooms/${id}`} className="sidebar__link">
        <div className="sidebarChat__main">
            <div className="sidebarChat" onClick={roomIdDispatch} >
                <Avatar src={profileURL} />
                <div className="sidebarChat__info" >
                    <h2>{name}</h2>
                    <p>
                        {messageArray()}
                        {arrayEmpty()}
                    </p>
                </div>
            </div>
            <div className="sidebarChat__arrow" onClick={deleteChat}><IconButton ><DeleteSweepIcon /></IconButton></div>
        </div>
        // </Link>

    ) : (
            <AddIcon onClick={createChat} />
        );
}

export default SidebarChat;
