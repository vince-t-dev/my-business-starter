import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Breadcrumb, Row, Col, Form, Card, Tab, Nav } from "react-bootstrap";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";

import ArticleFormDetails from "../components/Articles/ArticleForm/ArticleDetails";
import ArticleExtra from "../components/Articles/ArticleForm/ArticleExtra";
import CustomModal from "../components/Modal";

import { useAuth } from "../context/auth";
import { useSite } from "../context/site"; 

function ArticleForm(props) {
    const navigate = useNavigate();
    const { id } = useParams();
    const isCreateNew = (id == "new");
    const [error, setError] = useState(null);
    const [item, setItem] = useState(null);
    let content_data = isCreateNew ? {"_embedded": { "Language": {"Id": 1 }}} : {};
    const [jsonData, setJsonData] = useState(content_data);
    const [isSaved, setIsSaved] = useState(true);
    const [isLoaded, setIsLoaded] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [step, setStep] = useState(1);
    const [eventKey, setEventKey] = useState(1);

    let auth = useAuth();
    let site = useSite();
    let url = new URL(window.location.href);

    // on load
    useEffect(() => { 
        // fetch data from api
        if (isCreateNew) {
            // empty values for create new form    
            setItem({_embedded: {}});
        } else {
            // fetch current content
            setIsLoaded(false);
            fetch(`/__xpr__/pub_engine/my-business-starter/element/article_json?id=${id}`, {
                method: "GET",
                headers: {
                    Auth: auth.user.token
                }
            })
            .then(res => res.json())
            .then(
                (result) => { 
                    // notes on data 
                    // item: main data retrieved from api
                    // jsonData: send only updated data back to server
                    // other updates to array-type data should be notified to jsondata via hooks
                    setIsLoaded(true);
                    setItem(result);
                    site.useDocumentTitle(result.Title);
                },
                (error) => {
                    setError(error);
                }
            )
        }
    },[]);

    // set warning message when user navigates away
    site.usePrompt("Are you sure you want to leave this screen?", isDirty/*, setOpenModal*/);

    // validation and rules
    const form = useFormik({
        // specify required fields here
        initialValues: {
            Title: item?.Title
        },
        enableReinitialize: true,
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: yup.object({
            Title: yup.string().required("Title is required")
            /*courses: yup.array(
                yup.object().shape({
                    Title: step == 1
                        ? yup.string().required("Course title is required")
                        : yup.string()
                })
            )*/
        }),
        onSubmit: values => {
            console.log("data to send: ", jsonData); 
            submit_content();
        }
    });

    // update data object
    const updateData = (name,value) => { 
        // update jsondata, item, and formik validations 
        site.useUpdateObject(jsonData, name, value);
        site.useUpdateObject(item, name, value);
        form.setFieldValue(name,value);
        // set dirty state
        setDirty(true);
    }

    // handle previous and next buttons
    const handleStepChange = (action) => {
        setStep(previousStep => {
            let active_step = action == "increment" ? previousStep + 1 : previousStep - 1;
            // scroll to top
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            return active_step;
        });
    }

    // submit form
	const submit_content = async (options) => {
        let formData = {};
        // add id param to make edits
        if (!isCreateNew) url.searchParams.append("id", item.Id);
        formData.data = jsonData;
        setIsSaved(false);
        // save and pub
		const response = await axios.post(`/__xpr__/pub_engine/my-business-starter/element/event_processor${url.search}`,JSON.stringify(formData), {
			headers: { 
                Auth: auth.user.token,
                "Content-Type": "application/json" 
            },
			withCredentials: true
		});
		// result
		let result = response;
        if (result) {
            setIsSaved(true);
            setItem(result.data);
            setJsonData(content_data);
            setDirty(false);
            // create new form: redirect back to listing page 
            // editing form: update states
            //if (isCreateNew)
            setOpenModal({type:"content-saved"});
            setTimeout(() => {
                navigate("/my-business/articles");
            },500);
            //else
            //    navigate({state: {item: result.data}});
        }
    };

    // set dirty state
    const setDirty = (state) => {
        setIsDirty(state);
    }
    
    return (
        <>
            <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-4">
                <div className="mb-4 mb-lg-0">
                    <Breadcrumb className="d-none d-md-inline-block">
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/my-business/" }}>Dashboard</Breadcrumb.Item>
                        <Breadcrumb.Item active>Edit Article</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            {item && 
            <Form className="form-content-update" onSubmit={form.handleSubmit}>
            
                <Tab.Container 
                    activeKey={eventKey}
                    onSelect={(k) => {setEventKey(k);setStep(k);}}>
                    <Row className="mb-4">
                        <Col sm="auto">
                            <Nav variant="tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="1">Overview</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="2">Extra</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                    </Row>
                    {/* content table */}
                    <Tab.Content>
                        <Tab.Pane eventKey="1" className="p-0">
                            {/* step 1 */}
                            <ArticleFormDetails item={item} jsonData={jsonData} form={form} updateData={updateData} setDirty={setDirty} step={step} isSaved={isSaved}/>
                        </Tab.Pane>
                        <Tab.Pane eventKey="2" className="p-0">
                            {/* step 2 */}
                            <ArticleExtra item={item} jsonData={jsonData} form={form} updateData={updateData} handleStepChange={handleStepChange} setDirty={setDirty} step={step} isSaved={isSaved}/>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
                
                {/* 'create new' snippet for later */}
                {/* isCreateNew ? 
                <Dropdown>
                    <Dropdown.Toggle as={Button} variant="primary">
                        {isSaved ? "Save" : "Saving" } { isSaved ? <span className="icon icon-small ms-1"><FontAwesomeIcon icon={faChevronDown} /></span> : <Spinner animation="border" variant="white" size="sm" className="ms-2"/> }
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dashboard-dropdown dropdown-menu-left mt-1">
                        <Dropdown.Item onClick={e => { submit_content("draft")}}>
                            Save as Draft
                        </Dropdown.Item>
                        <Dropdown.Item onClick={e => { submit_content("publish")}}>
                            Publish
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>*/}
            </Form>
            }

            <CustomModal modal={openModal}/>

            {/* skeleton loader */}
            { !isLoaded &&
            <>
            <Row className="mb-4">
                <Col sm="auto">
                    <Nav variant="tabs">
                        <Nav.Item>
                            <Nav.Link eventKey="1" className="active">Overview</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="2">Extra</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>
            <Row className="mb-5">
                <Col sm={8}>
                    <Card border="light" className="shadow-sm">
                        <Card.Body className="p-5">
                            <Row className="justify-content-end align-items-center">
                                <Col sm={12}>
                                    <div className="mb-4">
                                        <Row className="justify-content-between">
                                            <Col sm={8} className="mb-3">
                                                <h2 className="heading-2">Details</h2>
                                                <p className="subheading-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col sm={12}>
                                                <Form.Group className="mb-4">
                                                    <div className="empty w-25 mb-2"></div>
                                                    <div><div className="empty w-50"></div></div>
                                                </Form.Group>
                                                <Form.Group className="mb-4">
                                                    <div className="empty w-25 mb-2"></div>
                                                    <div><div className="empty w-75"></div></div>
                                                </Form.Group>
                                                <Form.Group className="mb-4">
                                                    <div className="empty w-25 mb-2"></div>
                                                    <div className="empty w-100 fh-250"></div>
                                                </Form.Group>
                                                <Form.Group className="mb-4">
                                                    <div className="empty w-25 mb-2"></div>
                                                    <div className="empty"></div>
                                                    <div><div className="empty w-75 mt-2"></div></div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={4}>
                    <Card border="light" className="shadow-sm">
                        <Card.Body>
                            <h2 className="heading-2 mb-3">SEO</h2>
                            <div className="empty w-25"></div>
                            <div><div className="empty w-75 mb-3"></div></div>
                            <div className="empty w-25"></div>
                            <div><div className="empty w-50 mb-3"></div></div>
                            <div className="empty w-25"></div>
                            <div className="empty mb-3"></div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            </>}
        </>
    );
}

export default ArticleForm;