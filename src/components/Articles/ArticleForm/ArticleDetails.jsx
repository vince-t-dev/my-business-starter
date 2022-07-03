import React, { useEffect, useState } from "react";
import { Button, Row, Col, Form, Card, CardGroup, Dropdown, Spinner } from "react-bootstrap";
import axios from "axios";
import TextEditor from "../../TextEditor";
import ImageEditor from "../../ImageEditor";
import { useAuth } from "../../../context/auth";
import { useSite } from "../../../context/site"; 

// step 1: content details
function ArticleDetails(props) {
    const form = props.form;
    const [item, setItem] = useState(props.item);
    const [jsonData, setJsonData] = useState(props.jsonData);
    const updateData = props.updateData;
    let auth = useAuth();
    let site = useSite();
    
    let food_course_schema = {
        Id: "course-"+Math.floor(Math.random() * 9999) + 1,
        Title: "",
        Description: "",
        Active: true,
        _embedded: {
            // courses - to be saved in Courses section
            Section: { Id: site.siteConfig.CoursesSectionId }
        },
        isNew: true
    };
    const [contentCard, setContentCard] = useState(props.item?._embedded?.CustomFields?._embedded?.FoodCourses || [food_course_schema]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState(props.item?._embedded?.Categories || []);

    // handle content cards (food courses)
    let addCardFields = () => {
        setContentCard([...contentCard, food_course_schema]);
    }
    const [coursesToDelete, setCoursesToDelete] = useState([]);
    let courses_to_delete = jsonData.coursesToDelete || [];
    let removeCardFields = (i) => {
        let updateContentCard = [...contentCard];
        // create a list of items to be deleted
        if (!contentCard[i]["isNew"]) {
            courses_to_delete.push(contentCard[i]["Id"]);
            setCoursesToDelete([...coursesToDelete],courses_to_delete);
            site.useUpdateObject(jsonData,"coursesToDelete",courses_to_delete);
        }
        updateContentCard.splice(i, 1);
        setContentCard(updateContentCard);
    }
    let handleCardChange = (index,e) => {
        let newContentCard = [...contentCard];
        if (!newContentCard[index]["isNew"]) newContentCard[index]["isDirty"] = true;
        newContentCard[index][e.target.name] = e.target.value;
        setContentCard(newContentCard);
    }
    // content card: update json data with changes
    site.useUpdateEffect(() => {
        site.useUpdateObject(jsonData,"_embedded.CustomFields._embedded.FoodCourses",contentCard);
        site.useUpdateObject(item,"_embedded.CustomFields._embedded.FoodCourses",contentCard);
        form.setFieldValue("courses", contentCard);
        props.setDirty(true);
    },[contentCard]);

    // on load
    useEffect(() => {
        // get categories
        const get_categories = async (options) => {
            let categories_params = {
                action: "getData",
                uri: "/categories/",
                params: {
                    order_fields: "Label",
                    order_dirs: "ASC",
                    per_page: "all"
                }
            }
            const categories = await axios.post("/__xpr__/pub_engine/my-business-starter/element/ajax_handler",JSON.stringify(categories_params), {
                headers: { 
                    Auth: auth.user.token,
                    "Content-Type": "application/json" 
                },
                withCredentials: true
            });
            setCategories(categories?.data);
        }
        get_categories();
    },[]);

    // handle categories
    const getSelectedCategories = (e,checkboxes) => {
        let selected_checkbox = checkboxes.find(a => a.Id == e.target.value);
        if (e.target.checked) {
            selected_checkbox.checked = true;
            if (!selectedCategories?.filter(checkbox => checkbox.Id == selected_checkbox.Id).length) setSelectedCategories(arr => [...arr, selected_checkbox]);
        } else {
            selected_checkbox.checked = false;
            setSelectedCategories(selectedCategories?.filter(checkbox => checkbox.Id != selected_checkbox.Id));
        }
    }
    const removeCheckbox = id => {
        setSelectedCategories(selectedCategories?.filter(checkbox => checkbox.Id != id));
    }

    // categories: update json data with changes
    site.useUpdateEffect(() => {
        site.useUpdateObject(jsonData,"_embedded.Categories",selectedCategories);
        site.useUpdateObject(item,"_embedded.Categories",selectedCategories);
        props.setDirty(true);
    },[selectedCategories]);

    return (
        <>
        { props.step == 1 &&
        <Row className="mb-5">
            <Col sm={8}>
                <Card border="light" className="shadow-sm">
                    <Card.Body className="p-5">
                        <Row className="justify-content-end align-items-center">
                            <Col sm={12} className="mb-4">
                                {/*<Row className="justify-content-between">
                                    <Col sm={8} className="mb-3">
                                        <h2 className="heading-2">Details</h2>
                                        <p className="subheading-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </Col>
                                </Row>*/}
                                <Row>
                                    <Col sm={12}>
                                        {/* ck editor */}
                                        <Form.Group className="ck-heading mb-4" controlId="Title">
                                            <Form.Label className="text-grape">Title</Form.Label>
                                            <TextEditor name="Title" value={item.Title} onChange={updateData}/>
                                            {form.errors.Title && form.touched.Title && (
                                                <div className="text-danger mt-2">{form.errors.Title}</div>
                                            )}
                                        </Form.Group>

                                        {/* image editor */}
                                        <Form.Group className="mb-4" controlId="Logo">
                                            <Form.Label className="text-grape">Picture</Form.Label>
                                            <ImageEditor name="_embedded.Picture" value={item._embedded?.Picture || ""} onChange={updateData}/>
                                        </Form.Group>

                                        <Form.Group className="mb-4" controlId="Description">
                                            <h2 className="heading-2 mt-5 mb-4">Description</h2>
                                            <TextEditor name="Description" value={item.Description} rte={true} onChange={updateData} placeholder="Enter description."/>
                                        </Form.Group>
                                    
                                        {/* content card group - food courses */}
                                        <Form.Group className="mb-4" controlId="card-group">
                                            <h2 className="heading-2 mt-5 mb-4">Courses</h2>
                                            <CardGroup className="mb-4">
                                                {contentCard?.map((card, index) => (
                                                <Card key={index}>
                                                    <Card.Body>
                                                        {index ? <Button variant="cherry" onClick={e => removeCardFields(index,e)}><i className="xpri-trash"></i></Button> : null}
                                                        <Form.Group className="mb-3" controlId={"Title"+index}>
                                                            <Form.Label className="text-grape">Title</Form.Label>
                                                            <Form.Control type="text" name="Title" value={card.Title} onChange={e => handleCardChange(index,e)} placeholder="Course title" className="fw-bold text-grape"></Form.Control>
                                                            {form.errors?.courses?.length && form.errors?.courses[index]?.Title && form.touched.courses[index]?.Title && (
                                                                <div className="text-danger mt-1">{form.errors.courses[index]?.Title}</div>
                                                            )}
                                                        </Form.Group>
                                                        <Form.Group className="mb-3" controlId={"Description"+index}>
                                                            <Form.Label className="text-grape">Description</Form.Label>
                                                            <Form.Control type="text" name="Description" value={card.Description} onChange={e => handleCardChange(index,e)} placeholder="Course description"></Form.Control>
                                                        </Form.Group>
                                                    </Card.Body>        
                                                </Card>
                                                ))}
                                            </CardGroup>      
                                            <div className="border dotted border-primary rounded-3 py-2 text-center">
                                                <Button variant="outline-primary" className="rounded-circle" onClick={addCardFields}><i className="xpri-plus"></i></Button>
                                            </div>
                                        </Form.Group>

                                        <hr/>

                                        {/* categories */}
                                        <h2 className="heading-2 mt-5 mb-4">Categories</h2>
                                        <Row className="justify-content-between">
                                            <Col sm={3}>
                                            <Dropdown className="multi-select">
                                                <Dropdown.Toggle bsPrefix="form-select" as={Col}>Select Tags <i className="xpri-caret text-gray-700 font-xs"></i></Dropdown.Toggle>
                                                <Dropdown.Menu bsPrefix="dropdown-menu px-2 py-3">
                                                    <nav className="scrollbar fh-150 overflow-auto">
                                                        {categories?.map((c,index) => (
                                                        <Form.Group controlId={c.Id} key={index}>
                                                            <Form.Check label={c.Label} inline checked={selectedCategories?.filter(checkbox => checkbox.Id == c.Id).length} onChange={e => {getSelectedCategories(e,categories)}} value={c.Id}/>
                                                        </Form.Group>))}
                                                    </nav>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            </Col>
                                            <Col>
                                                <Form.Group className="mb-4">
                                                    <section className="tags mb-4">
                                                        {selectedCategories?.map((el,index) => (
                                                        <Button variant="outline-gray-700" key={index}>
                                                            <Form.Control type="button" plaintext htmlSize={el.Name?.length < 11 ? 11 : el.Name?.length} name={el.Name} value={el.Label}></Form.Control>
                                                            <i className="xpri-trash text-gray" onClick={e => removeCheckbox(el.Id)}></i>
                                                        </Button>
                                                        ))}
                                                    </section>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="mt-3">
                                            <Col className="d-flex justify-content-end">
                                                <Button variant="primary" type="submit" className="shadow">
                                                    { props.isSaved ? "Save" : "Saving" } { !props.isSaved && <Spinner animation="border" variant="white" size="sm" className="ms-2"/> }
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
            <Col sm={4} as={CardGroup}>
                <Card className="shadow-sm">
                    <Card.Body>
                        <h2 className="heading-2">SEO</h2>
                        <Form.Group className="mb-3" controlId="DefaultPageTitle">
                            <Form.Label>Slug</Form.Label>
                            <Form.Control type="text" name="Slug" defaultValue={item.Slug} onChange={e => updateData(e.target.name,e.target.value)} placeholder="Enter Slug"></Form.Control>
                        </Form.Group>
                        
                        <Form.Group className="mb-3" controlId="MetaTagKeywords">
                            <Form.Label>Tags</Form.Label>
                            <Form.Control type="text" name="ShortDescription" defaultValue={item.ShortDescription} onChange={e => updateData(e.target.name,e.target.value)} placeholder="Enter Tags"></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="MetaTagDescription">
                            <Form.Label>Social Network Description</Form.Label>
                            <div className="textarea-form-control">
                                <Form.Control as="textarea" name="Html" defaultValue={item.Html} onChange={e => updateData(e.target.name,e.target.value)} placeholder="Enter Social Network Description"></Form.Control>
                            </div>
                        </Form.Group>
                    </Card.Body>
                </Card>
            </Col>
        </Row>}
        </>
    )
}

export default ArticleDetails;