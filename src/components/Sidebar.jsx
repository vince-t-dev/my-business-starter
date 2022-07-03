
import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { CSSTransition } from 'react-transition-group';
import { Nav, Badge, Image, Button, Accordion, Navbar } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from "../context/auth";

import { AllRoutes } from "../routes";

export default (props = {}) => {
	const location = useLocation();
	const params = useParams();
	const { pathname } = location;
	const [show, setShow] = useState(false);
	const showClass = show ? "show" : "";
	let auth = useAuth();

	const onCollapse = () => setShow(!show);

	const CollapsableNavItem = (props) => {
		const { eventKey, title, icon, children = null, badgeText, image } = props;
		let default_key = "";
		let event_key_array = eventKey.split(",");
		for(let i=0;i<event_key_array.length;i++) {
			if (pathname.indexOf(event_key_array[i]) !== -1) default_key = eventKey;
		}
		const defaultKey = event_key_array ? default_key : pathname.indexOf(eventKey) !== -1 ? eventKey : "";
		//const { title, link, external, target, icon, image, badgeText, badgeBg = "secondary", badgeColor = "primary" } = props;
		const classNames = badgeText ? "d-flex justify-content-start align-items-center justify-content-between" : "";

		return (
		<Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
			<Accordion.Item eventKey={eventKey}>
			<Accordion.Button as={Nav.Link} className="d-flex justify-content-between align-items-center">
				<span className="d-flex align-items-center">
					{icon ? <span className="d-flex sidebar-icon"><i className={"xpri-"+icon}/> </span> : null}
					{image ? <Image src={image} width={20} height={20} className="sidebar-icon svg-icon" /> : null}

					<span className="sidebar-text">{title}</span>
				</span>
			</Accordion.Button>
			<Accordion.Body className="multi-level">
				<Nav className="flex-column">
					{children}
				</Nav>
			</Accordion.Body>
			</Accordion.Item>
		</Accordion>
		);
	};

	const NavItem = (props) => {
		const { title, link, external, target, icon, image, badgeText, badgeBg = "secondary", badgeColor = "primary" } = props;
		const classNames = badgeText ? "d-flex justify-content-start align-items-center justify-content-between" : "";
		
		return (
		<Nav.Item onClick={() => setShow(false)}>
			<NavLink to={link} className={({ isActive }) => ((isActive) ? 'nav-link active' : 'nav-link')}>
				<span className="d-flex align-items-center">
					{icon ? <span className="d-flex sidebar-icon"><i className={"xpri-"+icon}/> </span> : null}
					{image ? <Image src={image} width={20} height={20} className="sidebar-icon svg-icon" /> : null}

					<span className="sidebar-text">{title}</span>
				</span>
				{badgeText ? (
					<Badge pill bg={badgeBg} text={badgeColor} className="badge-md notification-count ms-2">{badgeText}</Badge>
				) : null}
			</NavLink>
		</Nav.Item>
		);
	};

	return (
	<>
		<Navbar expand={false} collapseOnSelect variant="light" className="navbar-theme-primary position-sticky top-0 px-4 d-md-none">
			<Navbar.Brand className="me-lg-5" as={Link} to={AllRoutes.Home.path}>
			<Image src="/__xpr__/pub_engine/my-business-starter/web/xprs-logo-dark.svg" className="navbar-brand-light" />
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="main-navbar" onClick={onCollapse}>
			<span className="navbar-toggler-icon" />
			</Navbar.Toggle>
		</Navbar>
		<CSSTransition timeout={300} in={show} classNames="sidebar-transition">
			<Navbar className={`collapse ${showClass} sidebar d-md-block bg-white text-white`}>
			<Navbar.Brand sticky="top" as={Link} to={AllRoutes.Home.path} className="d-none d-sm-flex w-100 align-items-center justify-content-center">
				<img src="/__xpr__/pub_engine/my-business-starter/web/xprs-logo-dark.svg" className="d-inline-block" alt="Expresia" height="1.25rem"/>
			</Navbar.Brand>
			<div className="sidebar-inner">
				<div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center">
				<div className="d-flex align-items-center ">
					{ auth.user?.data?._embedded?.CustomFields?._embedded?.ProfileImage.SourcePath ?
					<Image src={auth.user?.data?._embedded?.CustomFields?._embedded?.ProfileImage?.SourcePath} className="user-avatar sm-avatar rounded-circle mx-3" />
					:
					<div className="user-avatar xs-avatar border rounded-circle mx-3"><i className="xpri-members m-0"></i></div>
					} 
					{/*<div className="user-avatar lg-avatar mx-4">
					<Image src={ProfilePicture} className="card-img-top rounded-circle border-white" />
					</div>*/}
					<div className="d-flex text-dark align-items-center">
					<h6 className="m-0">{auth.user?.data ? auth.user.data.FirstName + " " + auth.user.data.LastName : "Welcome back!" }</h6>
					<Button as={Link} variant="link" size="xs" to={AllRoutes.Login.path} className="text-dark mx-3">
						<i className="xpri-logout me-2"></i> Sign Out
					</Button>
					</div>
				</div>
				<Nav.Link className="collapse-close d-md-none text-dark p-0 pe-3" onClick={onCollapse}>
					<i className="xpri-close"></i>
				</Nav.Link>
				</div>
				<Nav className="flex-column">
					<CollapsableNavItem eventKey="articles" title="Content" icon="dashboard-alt-2">
						<NavItem title="Articles" link="/my-business/articles" icon="details" />
					</CollapsableNavItem>
					{/*<NavItem title="Attendees" link="/my-business/attendees" icon="members"/>*/}
				</Nav>
			</div>
			</Navbar>
		</CSSTransition>
	</>
	);
};
