import React, { useEffect, useState } from "react";
import { Button, Row, Col, Form, Card, CardGroup, Spinner } from "react-bootstrap";
import TextEditor from "../../TextEditor";
import ImageEditor from "../../ImageEditor";

// step 1: content details
function ArticleExtra(props) {
    const form = props.form;
    const [item, setItem] = useState(props.item);
    const [jsonData, setJsonData] = useState(props.jsonData);
    const updateData = props.updateData;
    
    return (
        <>
        { props.step == 2 &&
        <Row className="mb-5">
            <Col sm={8}>
                <Card border="light" className="shadow-sm">
                    <Card.Body className="p-5">
                        <Row className="justify-content-end align-items-center">
                            <Col sm={12} className="mb-4">
                                {<Row className="justify-content-between">
                                    <Col sm={8} className="mb-3">
                                        <h2 className="heading-2">Extra</h2>
                                        <p className="subheading-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </Col>
                                </Row>}
                                <Row>
                                    <Col sm={12}>
                                        {/* ck editor */}
                                        <Form.Group className="mb-4" controlId="Description">
                                            <h2 className="heading-2 mb-4">Custom Text</h2>
                                            <TextEditor name="Description" value={item.Description} rte={true} onChange={updateData} placeholder="Enter description."/>
                                        </Form.Group>
                                    
                                        <Form.Group className="ck-heading mb-4" controlId="Title">
                                            <Form.Label className="text-grape">Custom Label</Form.Label>
                                            <TextEditor name="Title" value={item.Title} onChange={updateData}/>
                                            {form.errors.Title && form.touched.Title && (
                                                <div className="text-danger mt-2">{form.errors.Title}</div>
                                            )}
                                        </Form.Group>

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

export default ArticleExtra;