import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumb, Button, Row, Col, Card } from "react-bootstrap";

import ArticlesTable from "../components/Articles/ArticlesTable";

function Articles() {
    return (
        <>
        <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-4">
            <div className="mb-4 mb-lg-0">
                <Breadcrumb className="d-none d-md-inline-block">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/my-business/" }}>Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item active>All Articles</Breadcrumb.Item>
                </Breadcrumb>
            </div>
        </div>

        <div className="table-settings mb-4">
            <Row className="align-items-center justify-content-between">
                <Col sm="auto">
                    <h1 className="heading-1 m-0 mb-2">All articles</h1>
                    <p className="subheading-1 text-dark">Create, edit, and publish your content.</p>
                </Col>
                <Col sm="auto">
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <Button as={Link} variant="primary" to={"/my-business/articles/edit/new"} state={{item: {}}}>
                            <i className="xpri-plus pe-1"></i> New Article
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
        
        <Card border="light" className="table-wrapper table-responsive shadow-sm">
            <Card.Body>
                {/* articles table */}
                <ArticlesTable/>
            </Card.Body>
        </Card>
        </>
    )
}

export default Articles;