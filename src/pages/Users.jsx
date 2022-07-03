import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, ButtonGroup, Row, Col, InputGroup, Form, Dropdown, Card, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCheck, faSearch, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import CustomPagination from "../components/Pagination";
import { useAuth } from "../context/auth";

function Users() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [users, setUsers] = useState([]);
    const [listPagination, setListPagination] = useState({});
    const [keyword, setKeyword] = useState("");
    const params = useParams();
    const navigate = useNavigate();
    let url = new URL(window.location.href);
    let page = Number(params["*"]?.split("p")[1] || 1);

    // update search keyword
    const updateKeyword = e => {
        setKeyword(e.target.value);    
    }

    // search form submit
    const getSearch = e => {
        e.preventDefault();
        // reset page to 1 when doing search
        (page == 1) ? fetchItems(keyword,1) : navigate("/my-business/users/p1");
    }

    // hooks: fetch data when page changes
    useEffect(() => {
        fetchItems(keyword);
    },[page]);

    // fetch items function
    let auth = useAuth();
    const fetchItems = (query,goToPage) => {
        setIsLoaded(false);
        url.searchParams.append("page", goToPage ? goToPage : page);
        if (query) url.searchParams.append("q", query);
        fetch(`/__xpr__/pub_engine/my-business-starter/element/users_json${url.search}`, {
            method: "GET",
            headers: {
                Auth: auth.user.token
            }
        })
        .then(res => res.json())
            .then(
            (result) => {
                setIsLoaded(true);
                setUsers(result._embedded?.User);
                setListPagination(result.Pagination);
            },
            (error) => {
                setIsLoaded(true);
                setError(error);
            }
        )
    };
    
    return (
        <>
            <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div className="mb-4 mb-lg-0">
                    <Breadcrumb className="d-none d-md-inline-block">
                        <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <div className="table-settings mb-4">
                <Row className="justify-content-between">
                    <Col sm="auto">
                        <h1 className="heading-1">Users</h1>
                    </Col>
                    <Col sm="auto">
                        <div className="btn-toolbar mb-2 mb-md-0">
                            <Button variant="primary">
                                <i className="xpri-plus pe-1"></i> New User
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>

            <div className="table-settings mb-4">
                <Form onSubmit={getSearch}>
                    <Row className="justify-content-between align-items-center">
                        <Col xs={9} lg={4} className="d-flex">
                        <InputGroup className="search-box">
                            <Form.Control size="lg" type="text" className="rounded-xl px-3" placeholder="Search" value={keyword} onChange={updateKeyword}/>
                            <InputGroup.Text className="rounded-xl">
                                <i className="xpri-search text-gray-500 font-xl"></i>
                            </InputGroup.Text>
                        </InputGroup>
                            <Form.Select className="w-25">
                                <option defaultChecked>All</option>
                                <option value="1">Active</option>
                                <option value="2">Inactive</option>
                                <option value="3">Pending</option>
                                <option value="3">Canceled</option>
                            </Form.Select>
                        </Col>
                        <Col xs={3} lg={8} className="text-end">
                            <Dropdown as={ButtonGroup} className="me-2">
                                <Dropdown.Toggle split as={Button} variant="link" className="text-dark m-0 p-0">
                                    <span className="icon icon-sm icon-gray">
                                        <FontAwesomeIcon icon={faSlidersH} />
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-right">
                                    <Dropdown.Item className="fw-bold text-dark">Show</Dropdown.Item>
                                    <Dropdown.Item className="d-flex fw-bold">
                                        10 <span className="icon icon-small ms-auto"><FontAwesomeIcon icon={faCheck} /></span>
                                    </Dropdown.Item>
                                    <Dropdown.Item className="fw-bold">20</Dropdown.Item>
                                    <Dropdown.Item className="fw-bold">30</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown as={ButtonGroup}>
                                <Dropdown.Toggle split as={Button} variant="link" className="text-dark m-0 p-0">
                                    <span className="icon icon-sm icon-gray">
                                        <FontAwesomeIcon icon={faCog} />
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-right">
                                    <Dropdown.Item className="fw-bold text-dark">Show</Dropdown.Item>
                                    <Dropdown.Item className="d-flex fw-bold">
                                        10 <span className="icon icon-small ms-auto"><FontAwesomeIcon icon={faCheck} /></span>
                                    </Dropdown.Item>
                                    <Dropdown.Item className="fw-bold">20</Dropdown.Item>
                                    <Dropdown.Item className="fw-bold">30</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Form>
            </div>
            
            <Card border="light" className="table-wrapper table-responsive shadow-sm">
                <Card.Body>
                    <Table className="user-table align-items-center">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Position</th>
                                <th>User Created at</th>
                            </tr>
                        </thead>
                        <tbody>
                        
                        {isLoaded && users?.map(u => (
                            <tr key={u.Id}>
                                <td>
                                    <span>
                                        <Card.Link className="d-flex align-items-center">
                                            <i className="xpri-members me-2"></i>
                                            <div className="d-block">
                                                <span className="fw-bold">{u.FirstName && u.LastName ? u.FirstName+" "+u.LastName : "Anonymous"}</span>

                                            </div>
                                        </Card.Link>
                                    </span>
                                </td>
                                <td><span><div className="small text-gray">{u.Email || "-"}</div></span></td>
                                <td><span><div className="small text-gray">{u.CompanyName || "-"}</div></span></td>
                                <td><span>{u.LastLogin || "long ago"}</span></td>
                            </tr>
                        ))}

                        { error && <div>Fetching users error: {error.message}</div> }
                        { !users && isLoaded && <tr><td colSpan="4"><div className="text-center my-3">No result found.</div></td></tr> }
                        </tbody>
                            
                        {/* skeleton loader */}
                        {!isLoaded &&
                            <tbody>
                                <tr>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty"></div></span></td>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-25"></div></span></td>
                                </tr>
                                <tr>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-50"></div></span></td>
                                    <td><span><div className="empty w-50"></div></span></td><td><span><div className="empty w-50"></div></span></td>
                                </tr>
                                <tr>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-75"></div></span></td>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-50"></div></span></td>
                                </tr>
                                <tr>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty"></div></span></td>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-25"></div></span></td>
                                </tr>
                                <tr>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-50"></div></span></td>
                                    <td><span><div className="empty w-50"></div></span></td><td><span><div className="empty w-50"></div></span></td>
                                </tr>
                                <tr>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-75"></div></span></td>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-25"></div></span></td>
                                </tr>

                                <tr>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty"></div></span></td>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-25"></div></span></td>
                                </tr>
                                <tr>
                                    <td><span><div className="empty"></div></span></td><td><span><div className="empty w-50"></div></span></td>
                                    <td><span><div className="empty w-50"></div></span></td><td><span><div className="empty w-50"></div></span></td>
                                </tr>
                            </tbody> 
                        }
                    </Table>

                    {/* pagination */}
                    { listPagination.totalPages > 0 && <CustomPagination totalPages={listPagination?.totalPages} page={page} href={"/my-business/users/p"}/> }
                </Card.Body>
            </Card>
        </>
    )
}

export default Users;