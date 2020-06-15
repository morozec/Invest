import React from 'react';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { useCookies } from 'react-cookie';

function Login(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [, setCookie] = useCookies(['jwt', 'name']);

    let type;
    if (props.location.state) {
        type = props.location.state.type;
    } else {
        type = 'login';
    }

    const handleEmailChanged = (e) => setEmail(e.target.value);
    const handlePasswordChanged = (e) => setPassword(e.target.value);
    const handleLogin = () => {

        const getJwt = async () => {
            try {
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
                if (response.ok) {
                    let token = await response.text();
                    setCookie('jwt', token);
                    setCookie('name', email);
                } 

                return response.ok;
            }
            finally {
                setIsLoading(false);
            }
        }

        getJwt().then((result) =>{
            if (result) props.history.push('/');
        });
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
                    {type === 'login' ? 'Login' : 'Register'}
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