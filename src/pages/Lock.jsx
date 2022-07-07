import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
    const form = useFormik({
        // specify required fields here
        initialValues: {
            password: ""
        },
        enableReinitialize: true,
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: yup.object({
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
      
    useEffect(() => {
        // redirect user if they are logged in  
        if (localStorage.getItem("user")) navigate("/my-business/", { replace: true });
        // redirect user to login if there is no storage data
        if (!token_obj) navigate("/my-business/login", {replace:true});
    },[]);

    return (
        <main>
            <section className="vh-100 bg-gradient-blue-black-purple d-flex align-items-center my-0">
                <Container>
                    <Row className="justify-content-center">
                        <Col xs={12} className="d-flex align-items-center justify-content-center">
                            <div className="bg-white rounded-lg p-4 p-lg-5 w-100 fmxw-500">
                                <div className="text-center text-md-center mb-4 mt-md-0">
                                    <div className="text-center text-md-center">
                                        <h5 className="text-primary">DASHBOARD</h5>
                                        <Image src="/__xpr__/pub_engine/my-business-starter/web/xprs-logo-dark.svg" className="navbar-brand-light mb-5" />
                                        <div className="d-flex align-items-center justify-content-center">
                                            { userData?._embedded?.CustomFields?._embedded?.ProfileImage.SourcePath &&
                                            <div className="user-avatar me-3"><Image src={userData?._embedded?.CustomFields?._embedded?.ProfileImage?.SourcePath} className="rounded-circle" /></div>} 
                                            <h3 className="mb-0">{userData?.FirstName} {userData?.LastName}</h3>
                                        </div>
                                        <p className="text-gray mt-2">{userData?.Username}</p>
                                    </div>
                                </div>
                                <Form onSubmit={form.handleSubmit} className="mt-2" noValidate>
                                    <Form.Group id="password" className="mb-4">
                                        <Form.Label className="text-grape">Password*</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="border-grape border-xs">
                                                <i className="xpri-unlock font-size-lg fw-bold"></i>
                                            </InputGroup.Text>
                                            <Form.Control required type={passwordInputType} name="password" onChange={e => {setPassword(e.target.value);form.setFieldValue(`password`, e.target.value);}} placeholder="Enter your password"  className="border-grape border-xs"/>
                                            <InputGroup.Text onClick={togglePasswordVisibility} className="border-grape border-xs">
                                                <i className={`${passwordIcon} font-size-lg fw-bold`}></i>
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                    <nav className="text-center py-3">
                                        <Button variant="primary" type="submit" className="w-auto px-4">
                                            Login { !isLoaded && <Spinner animation="border" variant="white" size="sm" className="ms-2"/>}
                                        </Button>
                                    </nav>
                                    
                                    {error && <Alert className="mb-3" variant="primary">{error}</Alert>}

                                    {form.errors?.password && form.touched.password && (
                                        <Alert className="mt-3" variant="primary">
                                           {form.errors?.password}
                                        </Alert>
                                    )}

                                    <p className="text-center mt-3">
                                        <Link as={Link} to="/my-business/login" className="text-grape text-decoration-none">
                                            Sign in with a different account
                                        </Link>
                                    </p>
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