import React, { useEffect, useState } from 'react';
import './App.css';
import Chat from './Chat';
import Sidebar from './Sidebar';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from './Login';
import { useStateValue } from "./StateProvider";
import Pusher from 'pusher-js';
import axios from './axios';


function App() {
  // eslint-disable-next-line
  const [{ user, roomId }, dispatch] = useStateValue();
  const [messages, setMessages] = useState([]);
  // const [roomRender, setRoomRender] = useState();

  useEffect(() => {
    axios.get('/messages/sync').then(response => {
      setMessages(response.data);
    });
  }, []);

  useEffect(() => {
    const pusher = new Pusher('07407037428713a7bba3', {
      cluster: 'ap2'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted', (newMessages) => {
      // alert(JSON.stringify(newMessages));
      setMessages([...messages, newMessages]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };

// eslint-disable-next-line
  }, [messages]);

  return (
    <div className="app">
      <div className="app__body" >

        {user ?
          (
            <Router>
              <Sidebar messages={messages} />
              <Switch>
                <Route path="/">
                  {roomId ? (<Chat messages={messages} />) : (<div className="app__noChatSelected"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/766px-WhatsApp.svg.png" alt="whatsapp-logo" /> </div>)}
                </Route>
              </Switch>
            </Router>
          ) :
          (
            <Login />
          )
        }

      </div>
    </div>
  );
}

export default App;
