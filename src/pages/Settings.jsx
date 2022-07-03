import React from "react";
import { Col, Row, Button, Card } from 'react-bootstrap';
import { useAuth } from "../context/auth";

export default () => {
	let auth = useAuth();
	return (
		<>
		<Row>
			<Col xs={12} xl={4}>
			<Row>
				<Col xs={12}>
					<Card border="light" className="text-center p-0 mb-4">
						<div className="profile-cover rounded-top"/>
						<Card.Body className="pb-5">
							{ auth.user?.data?._embedded?.CustomFields?._embedded?.ProfileImage.SourcePath ?
							<Card.Img src={auth.user?.data?._embedded?.CustomFields?._embedded?.ProfileImage.SourcePath} alt="" className="user-avatar large-avatar rounded-circle mx-auto mt-n7 mb-4" />
							:
							""
							}
							<Card.Title>{auth.user?.data ? auth.user.data.FirstName + " " + auth.user.data.LastName : "Welcome back!" }</Card.Title>
							<Card.Subtitle className="fw-normal">Senior Software Engineer</Card.Subtitle>
							<Card.Text className="text-gray mb-4">{ auth.user?.data?.City ? auth.user?.data?.City : "Vancouver BC"}</Card.Text>

							<Button variant="primary" className="m-auto">
								Connect
							</Button>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			</Col>
		</Row>
		</>
	);
};