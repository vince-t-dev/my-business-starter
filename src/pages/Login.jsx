import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Col, Row, Form, Image, Button, Container, InputGroup, Alert, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuth } from "../context/auth";


function Login(props) {
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputType = showPassword ? "text" : "password";
    const passwordIcon = showPassword ? "xpri-eye-alt" : "xpri-eye-slash";
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    let navigate = useNavigate();
    let location = useLocation();
    let from = (location.state && location.state.from) ? location.state.from.pathname : "/my-business/";
    let auth = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoaded, setIsLoaded] = useState(true);

    let credentials = { 
        UserLogin: username, 
        UserPassword: password
    }

    // submission
    // validation and rules
    const form = useFormik({
        // specify required fields here
        initialValues: {
            username: "",
            password: ""
        },
        enableReinitialize: true,
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: yup.object({
            username: yup.string().email().required("Email is required"),
            password: yup.string().required("Password is requred")
        }),
        onSubmit: values => {
            handleLogin();
        }
    });

    const handleLogin = () => {
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
      
    // redirect user if they are logged in
    useEffect(() => {
        if (localStorage.getItem("user")) navigate(from, { replace: true });
    },[]);

    return (
        <main>
            <section className="vh-100 bg-gradient-blue-black-purple d-flex align-items-center my-0">
                <Container>
                    <Row className="justify-content-center">
                        <Col xs={12} className="d-flex align-items-center justify-content-center">
                            <div className="bg-white rounded-lg p-4 p-lg-5 w-100 fmxw-500">
                                <div className="text-center text-md-center mb-4 mt-md-0">
                                    <div className="text-center text-md-center mb-4 mt-md-0">
                                        <h5 className="text-primary">DASHBOARD</h5>
                                        <Image src="/__xpr__/pub_engine/my-business-starter/web/xprs-logo-dark.svg" className="navbar-brand-light mb-4" />
                                    </div>
                                </div>
                                <Form onSubmit={form.handleSubmit} className="my-3" noValidate>
                                    <Form.Group id="email" className="mb-4">
                                        <Form.Label className="text-grape">Email*</Form.Label>
                                        <InputGroup>
                                            <Form.Control autoFocus required type="text" name="username" onChange={e => { setUsername(e.target.value);form.setFieldValue(`username`, e.target.value);}} placeholder="example@company.com" className="border-grape border-xs"/>
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group id="password" className="mb-4">
                                        <Form.Label className="text-grape">Password*</Form.Label>
                                        <InputGroup>
                                            <Form.Control required type={passwordInputType} name="password" onChange={e => {setPassword(e.target.value);form.setFieldValue(`password`, e.target.value);}} placeholder="Password" className="border-grape border-xs"/>
                                            <InputGroup.Text onClick={togglePasswordVisibility} className="border-grape border-xs">
                                                <i className={`${passwordIcon} xpri-eye-slash font-size-lg fw-bold`}></i>
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                    <nav className="text-center py-3">
                                        <Button variant="primary" type="submit" className="w-auto px-4">
                                            Login { !isLoaded && <Spinner animation="border" variant="white" size="sm" className="ms-2"/>}
                                        </Button>
                                    </nav>
                                    
                                    {error && <Alert className="mt-3" variant="primary">{error}</Alert>}
                                    {(form.errors?.username && form.touched.username || form.errors?.password && form.touched.password) && (
                                        <Alert className="mt-3" variant="primary">
                                           Email and password are required
                                        </Alert>
                                    )}
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