import React, { useEffect } from 'react';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

function Login(props) {
    const { userData, setUserData } = props;
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginChanged = (e) => setLogin(e.target.value);
    const handlePasswordChanged = (e) => setPassword(e.target.value);
    const handleLogin = () => {

        const getUserData = async () => {
            let isOkLogin = false;
            try{
                setShowError(false);
                setErrorMessage(false);
                setIsLoading(true);

                let response = await fetch('api/account/token', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json;charset=utf-8"
                    },
                    body: JSON.stringify({
                        login,
                        password
                    })
                })
                let data = await response.json();
                if (response.ok) {
                    setUserData(data);
                    isOkLogin = true;
                } else {
                    setShowError(true);
                    setErrorMessage(data.errorText);
                }
            }
            finally{
                setIsLoading(false);
            }
            return isOkLogin;
        }

        getUserData().then(result => {
            if (result) props.history.push('/');
        })
    }

    return (
        <Form>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Login</Form.Label>
                <Form.Control type="" placeholder="Enter login" value={login} onChange={handleLoginChanged} />
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