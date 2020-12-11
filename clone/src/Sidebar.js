import React, { useEffect } from 'react';
import './Sidebar.css';
import { Avatar, IconButton } from '@material-ui/core';
// import AddIcon from '@material-ui/icons/Add';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import { SearchOutlined } from '@material-ui/icons';
import SidebarChat from './SidebarChat';
import { useStateValue } from "./StateProvider";
import axios from './axios';
import Pusher from 'pusher-js';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import { GoogleLogout } from 'react-google-login';


function Sidebar({ messages }) {

    const [{ user, room }, dispatch] = useStateValue();

    useEffect(() => {

        axios.get('/rooms/sync').then(response => {
            var usersToPush = [];
            response.data.map(resData => (
                (resData.users.includes(user.email)) ? (usersToPush.push(resData)) : (null)
            ));

            dispatch({
                type: "SET_ROOM",
                room: usersToPush,
            });

            usersToPush = [];
        })
        
    }, [user,dispatch]);


    // useEffect(() => {
    //     // console.log(room);
    //     console.log(roomId);
    // }, [room, roomId]);


    useEffect(() => {
        const pusher = new Pusher('07407037428713a7bba3', {
            cluster: 'ap2'
        });

        const channel = pusher.subscribe('room');
        channel.bind('inserted', (newRoom) => {

            // console.log(newRoom);

            return (newRoom.users.includes(user.email) ? (
                dispatch({
                    type: "SET_ROOM",
                    room: [...room, newRoom],
                })
            ) : null);

        });

        channel.bind('deleted', (newRoom) => {

            const oldRoom = room;
            const filteredRoom = oldRoom.filter(ids => ids._id !== newRoom);

            dispatch({
                type: "SET_ROOM",
                room: filteredRoom.filter(ids => ids._id !== newRoom),
            });

            dispatch({
                type: "SET_ROOMID",
                roomId: "",
            });

        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
        // eslint-disable-next-line
    }, [room]);

    const logout = () => {
        window.open('http://localhost:3000', '_self');
    }

    return (
        <div className="sidebar">

            <div className="sidebar__header">
                <Avatar src={user.imageUrl} />
                <div className="sidebar__headerRight">
                    <IconButton>
                        <DonutLargeIcon />
                    </IconButton>
                    <IconButton>
                        <SidebarChat addNewChat />
                    </IconButton>

                    <GoogleLogout
                        clientId={process.env.REACT_APP_CLIENT_ID}
                        render={renderProps => (
                            <IconButton onClick={renderProps.onClick} disabled={renderProps.disabled}>
                                <ExitToAppIcon />
                            </IconButton>

                        )}
                        buttonText="Logout"
                        onLogoutSuccess={logout}
                        isSignedIn={false}
                    >
                    </GoogleLogout>
                    {/* </IconButton> */}
                </div>
            </div>

            <div className="sidebar__search">
                <div className="sidebar__searchContainer">
                    <SearchOutlined />
                    <input type="text" placeholder="Search or Start new chat" />
                </div>
            </div>

            <div className="sidebar__chats" >
                {(room.map(resData => (<SidebarChat key={resData._id} id={resData._id} name={resData.roomName} messages={messages} />)))}

            </div>

        </div>
    )
}

export default Sidebar;
