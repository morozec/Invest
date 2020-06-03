import React, { useEffect } from 'react';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

function Login(props) {
    const { userData, setUserData} = props;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    let type;
    if (props.location.state){
        type = props.location.state.type;
    }else{
        type = 'login';
    }

    const handleEmailChanged = (e) => setEmail(e.target.value);
    const handlePasswordChanged = (e) => setPassword(e.target.value);
    const handleLogin = () => {

        const getUserData = async () => {
            try{
                setShowError(false);
                setErrorMessage(false);
                setIsLoading(true);

                let response = await fetch(`api/account/${type}`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json;charset=utf-8"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                })
                let token = await response.text();
                setUserData({
                    token,
                    email
                })
                // if (response.ok) {
                //     setUserData(data);
                //     isOkLogin = true;
                // } else {
                //     setShowError(true);
                //     setErrorMessage(data.errorText);
                // }
            }
            finally{
                setIsLoading(false);
            }
        }

        getUserData().then(() => props.history.push('/'));
    }

    return (
        <Form>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="" placeholder="Enter email" value={email} onChange={handleEmailChanged} />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={handlePasswordChanged} />
            </Form.Group>

            <Form.Group>
                <Button variant="primary" type="button" onClick={handleLogin} disabled={isLoading}>
                    Login
             </Button>
            </Form.Group>

            {showError &&
                <Form.Group>
                    <Form.Label className='error'>{errorMessage}</Form.Label>
                </Form.Group>
            }

        </Form>
    )
}

export default withRouter(Login)