import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Col, Row, Form, Image, Button, Container, InputGroup, Alert, Spinner, Card } from 'react-bootstrap';
import { useAuth } from "../context/auth";

function Login(props) {
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputType = showPassword ? "text" : "password";
    const passwordIconColor = showPassword ? "#262B40" : "";
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    let navigate = useNavigate();
    let location = useLocation();
    const token_obj = localStorage.getItem("invalid_token") ? JSON.parse(localStorage.getItem("invalid_token")) : null;
    let from = token_obj?.from;
    let userData = token_obj ? token_obj.user_info : {};
    let auth = useAuth();

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoaded, setIsLoaded] = useState(true);

    let credentials = { 
        UserLogin: userData?.Username, 
        UserPassword: password
    }

    // submission
    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoaded(false);
        auth.signin(credentials,(res) => {
            setIsLoaded(true);
            // success: redirect to last visit page
            if (res.status == "SUCCESS") {    
                navigate(from, { replace: true });
            // error: set error    
            } else if (res.error) {
                if (res.error == 403) setError("Incorrect username or password.");
                if (!res?.error) setError("No server response"); 
            }
        });
    };
      
    useEffect(() => {
        // redirect user if they are logged in  
        if (localStorage.getItem("user")) navigate("/my-business/", { replace: true });
        // redirect user to login if there is no storage data
        if (!token_obj) navigate("/my-business/login", {replace:true});
    },[]);

    return (
        <main>
            <section className="vh-100 bg-soft d-flex align-items-center my-0">
                <Container>
                    {<p className="text-center">
                        <Card.Link as={Link} to="/my-business/login" className="text-dark">
                            Sign in with a different account
                        </Card.Link>
                    </p>}
                    <Row className="justify-content-center form-bg-image">
                        <Col xs={12} className="d-flex align-items-center justify-content-center">
                            <div className="bg-white shadow-sm rounded p-4 p-lg-5 w-100 fmxw-500">
                                <div className="text-center text-md-center mb-4 mt-md-0">
                                    {/*<div className="user-avatar large-avatar mx-auto mb-3 border-dark p-2">
                                    <Image src={Profile3} className="rounded-circle" />
                                    </div>*/}
                                    <Image src="/__xpr__/pub_engine/my-business-starter/web/xprs-logo-dark.svg" className="navbar-brand-light mb-4" />
                                    <div className="text-center text-md-center mb-4 mt-md-0">
                                       
                                            { userData?._embedded?.CustomFields?._embedded?.ProfileImage.SourcePath ?
                                            <div className="user-avatar large-avatar mx-auto mb-3 border-dark p-2"><Image src={userData?._embedded?.CustomFields?._embedded?.ProfileImage?.SourcePath} className="rounded-circle" /></div>
                                            :
                                            <i className="xpri-user text-gray display-1 my-3"></i>
                                            } 
                                        
                                        <h3 className="mb-2">{userData?.FirstName} {userData?.LastName}</h3>
                                        <p className="text-gray">{userData?.Username}</p>
                                    </div>
                                </div>
                                <Form onSubmit={e => handleLogin(e)} className="mt-2">
                                    <Form.Group id="password" className="mb-4">
                                        <Form.Label>Your Password</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                            <i className="xpri-unlock"></i>
                                            </InputGroup.Text>
                                            <Form.Control required type={passwordInputType} name="password" onChange={e => setPassword(e.target.value)} placeholder="Password" />
                                            <InputGroup.Text onClick={togglePasswordVisibility}>
                                            <i className="xpri-eye-alt"></i>
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="w-100">
                                        Login { !isLoaded && <Spinner animation="border" variant="white" size="sm" className="ms-2"/>}
                                    </Button>
                                    
                                    {error && <Alert className="mt-3" variant="primary">{error}</Alert>}
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </main>
    );
}

export default Login;