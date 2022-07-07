
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Row, Col, Nav, Image, Navbar, Dropdown, ListGroup, Spinner } from 'react-bootstrap';
import { useAuth } from "../context/auth";
import NOTIFICATIONS_DATA from "../data/notifications";

export default (props) => {
	// notifications
  	const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  	const areNotificationsRead = notifications.reduce((acc, notif) => acc && notif.read, true);
  	const markNotificationsAsRead = () => {
    	setTimeout(() => {
        	setNotifications(notifications.map(n => ({ ...n, read: true })));
    	}, 300);
  	};

  	const Notification = (props) => {
    	const { link, sender, image, time, message, read = false } = props;
    	const readClassName = read ? "" : "text-info";
		
		return ( 
		<ListGroup.Item action href={link} className="border-bottom border-light">
			<Row className="align-items-center">
			<Col className="col-auto">
				<Image src={image} className="user-avatar lg-avatar rounded-circle" />
			</Col>
			<Col className="ps-0 ms--2">
				<div className="d-flex justify-content-between align-items-center">
				<div>
					<h4 className="h6 mb-0 text-small">{sender}</h4>
				</div>
				<div className="text-end">
					<small className={readClassName}>{time}</small>
				</div>
				</div>
				<p className="font-small mt-1 mb-0">{message}</p>
			</Col>
			</Row>
		</ListGroup.Item>
		);
	};

	// logout
	const [isLoaded, setIsLoaded] = useState(true);
	const [showRightDropdown, setShowRightDropdown] = useState(false);
	const navigate = useNavigate();
	let auth = useAuth();
	const handleLogout = e => {
		setIsLoaded(false);
		setShowRightDropdown(true);
		auth.signout(res => {
			navigate("/");
        });
	};

  	return (
    <Navbar sticky="top" variant="light" className="navbar-top bg-white d-none d-sm-flex" expanded>
		<div className="d-flex justify-content-between w-100">
			<div className="navbar-brand d-flex align-items-center ps-3 ps-sm-0">
				<i className="xpri-xpr-2 text-grape me-3"></i>
				<h4 className="text-grape">MY BUSINESS</h4>
			</div>
			<Nav className="align-items-center">
				<Dropdown as={Nav.Item} onToggle={markNotificationsAsRead} >
					{/* hide it for now */}
					<Dropdown.Toggle as={Nav.Link} className="d-none text-dark icon-notifications p-0">
						<span className="icon icon-sm">
							<i className="xpri-bell"></i>
							{areNotificationsRead ? null : <span className="icon-badge rounded-circle unread-notifications" />}
						</span>
					</Dropdown.Toggle>
					<Dropdown.Menu className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-center mt-2 py-0">
						<ListGroup className="list-group-flush">
							<Nav.Link href="#" className="text-center text-primary fw-bold border-bottom border-light py-3">
								Notifications
							</Nav.Link>

							{notifications.map(n => <Notification key={`notification-${n.id}`} {...n} />)}

							<Dropdown.Item className="text-center text-primary fw-bold py-3">
								View all
							</Dropdown.Item>
						</ListGroup>
					</Dropdown.Menu>
				</Dropdown>
				<span className="divider"></span>
				<Dropdown as={Nav.Item} show={showRightDropdown} 
					onToggle={(isOpen, event) => {
						if (event.source !== "select") setShowRightDropdown(isOpen);
					}}>
					<Dropdown.Toggle as={Nav.Link} className="p-0 m-0">
						<div className="media d-flex align-items-center">
							{auth.user?.data?._embedded?.CustomFields?._embedded?.ProfileImage.SourcePath 
							? <Image src={auth.user?.data?._embedded?.CustomFields?._embedded?.ProfileImage?.SourcePath} className="user-avatar sm-avatar rounded-circle me-3" />
							: <div className="user-avatar xs-avatar border rounded-circle me-3"><i className="xpri-members m-0"></i></div>} 
							<div className="media-body ms-2 text-dark align-items-center d-none d-lg-block">
								<span>{auth.user?.data ? auth.user.data.FirstName + " " + auth.user.data.LastName : "Welcome back!" }</span>
								<i className="xpri-arrow-right ms-2 text-cherry"></i>
							</div>
						</div>
					</Dropdown.Toggle>
					<Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
						<Dropdown.Item onClick={() => {setShowRightDropdown(false);/*navigate("/my-business/settings");*/}}>
						<i className="xpri-user me-2"></i> My Profile
						</Dropdown.Item>
						<Dropdown.Item onClick={() => {setShowRightDropdown(false)}}>
						<i className="xpri-cog me-2"></i> Support
						</Dropdown.Item>

						<Dropdown.Divider />

						<Dropdown.Item onClick={(e) => {handleLogout(e)}}>
						{ !isLoaded ? <Spinner animation="border" variant="dark" size="sm" className="me-2"/> : <i className="xpri-logout text-danger me-2"></i>}  Logout 
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</Nav>
		</div>
    </Navbar>
  );
};
