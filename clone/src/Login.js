import React from 'react';
import { Button } from '@material-ui/core';
import "./Login.css";
import GoogleLogin from 'react-google-login';
import axios from './axios.js';
import { useStateValue } from "./StateProvider";



function Login() {

    // eslint-disable-next-line
    const [{ user }, dispatch] = useStateValue();

    async function loginDetailsToBackend(response) {


        dispatch({
            type: "SET_USER",
            user: response.profileObj,
        });

        await axios.post('/users/login', {
            "loggedInUserId": response.profileObj.googleId,
            "email": response.profileObj.email,
            "name": response.profileObj.name,
            "imageURL": response.profileObj.imageUrl
        });

        console.log('hi');


    }

    const responseGoogle = (response) => {
        alert("failure");
    }

    return (
        <div className="login">
            <div className="login__container">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/766px-WhatsApp.svg.png" alt="whatsapp-logo" />

                <div className="login__text">
                    <h1>Sign in to WhatsApp</h1>
                </div>

                <GoogleLogin
                    clientId={process.env.REACT_APP_CLIENT_ID}
                    render={renderProps => (
                        <Button onClick={renderProps.onClick} disabled={renderProps.disabled}>
                            Sign in with Google
                        </Button>
                    )}
                    buttonText="Login"
                    onSuccess={loginDetailsToBackend}
                    onFailure={responseGoogle}
                    isSignedIn={true}
                    cookiePolicy={'single_host_origin'}
                />

            </div>

        </div>
    )
}

export default Login;


