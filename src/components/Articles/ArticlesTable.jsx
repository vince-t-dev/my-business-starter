import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Row, Col, InputGroup, Form, Table, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import moment from "moment";
import CustomPagination from "../Pagination";
import CustomModal from "../Modal";
import { useAuth } from "../../context/auth";
import { useSite } from "../../context/site"; 
import Footer from "../Footer";
import DateTimePicker from "../DateTimePicker";

function ArticlesTable(props) {
    let site = useSite();
    let auth = useAuth();
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const { sorteditems, requestSort, sortConfig } = site.useSortableData(items);
    const getClassNamesFor = (name) => {
        if (!sortConfig) return;
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [listPagination, setListPagination] = useState({});
    const [keyword, setKeyword] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [openModal, setOpenModal] = useState(null);
    const params = useParams();
    const navigate = useNavigate();

    let url = new URL(window.location.href);
    let page = Number(params["*"]?.split("p")[1] || 1);

    // update search keyword
    const updateKeyword = e => {
        setKeyword(e.target.value);    
    }
    // hit enter to submit
    const submitKeyword = e => {
        if (e.key === "Enter") fetchItems(keyword, page);
    }

    // search form submit
    const getSearch = e => {
        e?.preventDefault();
        // reset page to 1 when doing search
        (page == 1) ? fetchItems(keyword,1) : navigate("/my-business/articles");
    }

    // hooks: page load
    useEffect(() => {
        if (props.loadData) fetchItems(keyword, page);
    },[]);

    // hooks: fetch data when page changes
    site.useUpdateEffect(() => {
        if (props.loadData) fetchItems(keyword, page);
    },[page]);
    
    // hooks: fetch data when date filter changes
    site.useUpdateEffect(() => {
        if (filterStartDate && filterEndDate) fetchItems(keyword, page);  
    },[filterStartDate,filterEndDate]);

    // fetch items
    const fetchItems = (query,goToPage) => {
        setIsLoaded(false);
        url.searchParams.append("page", goToPage ? goToPage : page);
        if (query) url.searchParams.append("q", query);
        if (filterStartDate) url.searchParams.append("start",filterStartDate);
        if (filterEndDate) url.searchParams.append("end",filterEndDate);
        if (site.siteConfig.ArticleSectionId) url.searchParams.append("section_id",site.siteConfig.ArticleSectionId);
        fetch(`/__xpr__/pub_engine/my-business-starter/element/articles_json${url.search}`, {
            method: "GET",
            headers: { Auth: auth.user.token }
        })
        .then(res => res.json())
        .then(
            (result) => {
                setIsLoaded(true);
                setItems(result._embedded?.Article);
                site.useDocumentTitle();
                setListPagination(result.Pagination);
            },
            (error) => {
                setIsLoaded(true);
                setError(error);
            }
        )
        setSelectedCheckboxes([]);
    }

    // handle multiple checkboxes
    const getSelectedCheckboxes = (e,checkboxes) => {
        let selected_checkbox = checkboxes.find(a => a.Id == e.target.value);
        if (e.target.checked) {
            selected_checkbox.checked = true;
            if (!selectedCheckboxes.filter(checkbox => checkbox.Id == selected_checkbox.Id).length) setSelectedCheckboxes(arr => [...arr, selected_checkbox]);
        } else {
            selected_checkbox.checked = false;
            setSelectedCheckboxes(selectedCheckboxes.filter(checkbox => checkbox.Id != selected_checkbox.Id));
        }
    }
    // toggle all checkboxes
    const toggleAllCheckboxes = (e,checkboxes) => {
        if (e.target.checked) {
            let check_all_items = checkboxes.map(a => {a.checked = true;return a;});
            setSelectedCheckboxes(check_all_items);
        } else {
            checkboxes.map(a => {a.checked = false;return a;});
            setSelectedCheckboxes([]);
        }
    }
    // reset all checkboxes
    const resetCheckboxes = (checkboxes) => {
        checkboxes.map(a => {a.checked = false;return a;});
        setSelectedCheckboxes([]);
    }

    // modal method
    const onModalClose = e => setOpenModal(false);
    // update data from modal
    const updateData = data => {
        // remove item from list
        setItems(prevItems => {
            let updated_items = prevItems.filter(item => item.Id != data);
            return updated_items;
        });
        setOpenModal(false);
        setSelectedCheckboxes([]);
    }
    // listen to load data prop to refresh table
    site.useUpdateEffect(() => {
        if (props.loadData) getSearch();
    },[props.loadData]);

    // update status
    const handleStatusChange = e => {
        // normalize data: accepting both article and object from footer component
        let name = e.target ? e.target.name : "Published";
        let value = e.target ? e.target.checked : e.checked;
        let id = e.target ? e.target.value : e.Id;
        let formData = {};
        resetCheckboxes(items);
        formData.action = "putData";
        formData.uri = "/articles/"+id;
        formData.data = {};
        formData.data[name] = value;
        fetch(`/__xpr__/pub_engine/my-business-starter/element/ajax_handler`, {
            method: "POST",
            headers: { Auth: auth.user.token },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            let updated_items = sorteditems.filter(item => {
                if (item.Id == id) item[name] = value;
                return sorteditems;
            });
            setItems(updated_items);
        })
        .then((error) => setError(error))    
    }

    return (
        <>
        <Form onSubmit={getSearch}>
            <Row className="justify-content-end align-items-center mb-3">
                <Col lg={8} className="d-flex justify-content-end">
                    <Form.Group className="d-flex">
                        <Form.Label column sm="3" className="font-sm fw-bold text-capitalize">From:</Form.Label>
                        <Col sm="8">
                            <DateTimePicker name="filterStartDate" value={filterStartDate} onChange={(name,value) => setFilterStartDate(value)} id="date-filter-from"/>
                        </Col>
                    </Form.Group>
                    <Form.Group className="d-flex">
                        <Form.Label column sm="2" className="font-sm fw-bold text-capitalize">To:</Form.Label>
                        <Col sm="8">
                            <DateTimePicker name="filterEndDate" value={filterEndDate} onChange={(name,value) => setFilterEndDate(value)} id="date-filter-to"/>
                        </Col>
                    </Form.Group>
                    <InputGroup className="search-box">
                        <Form.Control size="lg" type="text" className="rounded-xl px-3" placeholder="Search" value={keyword} onChange={updateKeyword} onKeyUp={submitKeyword}/>
                        <InputGroup.Text className="rounded-xl">
                            <i className="xpri-search text-gray-500 font-xl"></i>
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>
        </Form>
        <Form>
            
            {/* list table */}
            <Table responsive="sm">
                <thead>
                    <tr>
                        <th><Form.Check inline onChange={e => {toggleAllCheckboxes(e,items)}}/></th>
                        <th className="w-25">Title <Button variant="icon" onClick={() => requestSort("Title")} className={getClassNamesFor("Title")}><i className="xpri-sort font-sm text-gray-700"></i></Button></th>
                        <th>Date <Button variant="icon" onClick={() => requestSort("StartDate")} className={getClassNamesFor("StartDate")}><i className="xpri-sort font-sm text-gray-700"></i></Button></th>
                        <th>Created On <Button variant="icon" onClick={() => requestSort("CreatedOn")} className={getClassNamesFor("CreatedOn")}><i className="xpri-sort font-sm text-gray-700"></i></Button></th>
                        <th>Published <Button variant="icon" onClick={() => requestSort("Active")} className={getClassNamesFor("Active")}><i className="xpri-sort font-sm text-gray-700"></i></Button></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>

                {isLoaded && sorteditems?.map(a => (
                    <tr key={"list-"+a.Id} className={a.checked ? "selected" : null}>
                        <td>
                            <span className="justify-content-start">
                                <Form.Check inline checked={a.checked || false} onChange={e => {getSelectedCheckboxes(e,items)}} value={a.Id}/>
                            </span>
                        </td>
                        <td><span><div className="text-truncate" dangerouslySetInnerHTML={{__html: a.Title}}></div></span></td>
                        <td><span><div className="text-truncate text-nowrap">{
                            a.StartDate 
                            ? moment(a.StartDate).format("MM") == moment(a.EndDate).format("MM")
                            ? moment(a.StartDate).format("MMM") + " " + moment(a.StartDate).format("DD") + `${ moment(a.StartDate).format("DD") != moment(a.EndDate).format("DD") ? " - " + moment(a.EndDate).format("DD") : "" }`+ " ," + moment(a.EndDate).format("YYYY")
                            : moment(a.StartDate).format("MMM") + " " + moment(a.StartDate).format("DD") + " - " + moment(a.EndDate).format("MMM") + " " + moment(a.EndDate).format("DD") + " ," + moment(a.EndDate).format("YYYY")
                            : "No date available"}
                        </div></span></td>
                        <td><span className="justify-content-start">{a.TotalTicketsSold}</span></td>
                        <td><span className="justify-content-start">{a.TotalSeatsRemaining}</span></td>
                        <td><span className="justify-content-start">{a.TotalWaitlist}</span></td>
                        <td>
                            <span className="justify-content-start">
                                <Form.Check type="switch" defaultChecked={a.Published} name="Published" value={a.Id} onChange={handleStatusChange} id={"switch-status-"+a.Id}/>
                            </span>
                        </td>
                        <td>
                            <span className="justify-content-end">
                                <div className="btn-group">
                                    <OverlayTrigger overlay={<Tooltip>Preview</Tooltip>}>
                                        <Link to={"/my-business/articles/view/"+a.Id} state={{item: a}} className="btn btn-link"><i data-toggle="tooltip" className="xpri-eye-alt"></i></Link>
                                    </OverlayTrigger>
                                    <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
                                        <Link to={"/my-business/articles/edit/"+a.Id} state={{item: a}} className="btn btn-link"><i data-toggle="tooltip" className="xpri-pencil"></i></Link>
                                    </OverlayTrigger>
                                    <OverlayTrigger overlay={<Tooltip>Trash</Tooltip>}>
                                        <Button type="button" onClick={e => { setOpenModal({type:"archive-articles", data: [a]}); }} variant="link"><i data-toggle="tooltip" className="xpri-trash"></i></Button>
                                    </OverlayTrigger>
                                </div>
                            </span>
                        </td>
                    </tr>
                ))}   
                { !sorteditems?.length && isLoaded && <tr><td colSpan="8"><div className="text-center my-3">{ error ? "Error fetching data: "+error.message : "No result found." }</div></td></tr> }
                </tbody>

                {/* skeleton loader */}
                { !isLoaded &&
                    <tbody>
                        <tr>
                            <td><span></span></td><td><span><div className="d-flex w-100 flex-wrap align-items-center"><div className="empty w-50"></div><div className="empty"></div></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td>
                        </tr>
                        <tr>
                            <td><span></span></td><td><span><div className="d-flex w-100 flex-wrap align-items-center"><div className="empty w-50"></div><div className="empty"></div></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty w-50"></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td>
                        </tr> 
                        <tr>
                            <td><span></span></td><td><span><div className="d-flex w-100 flex-wrap align-items-center"><div className="empty"></div><div className="empty w-50"></div></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td>
                        </tr> 
                        <tr>
                             <td><span></span></td><td><span><div className="d-flex w-100 flex-wrap align-items-center"><div className="empty w-50"></div><div className="empty"></div></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty w-50"></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td>
                        </tr> 
                        <tr>
                            <td><span></span></td><td><span><div className="d-flex w-100 flex-wrap align-items-center"><div className="empty w-50"></div><div className="empty"></div></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td>
                        </tr>
                        <tr>
                            <td><span></span></td><td><span><div className="d-flex w-100 flex-wrap align-items-center"><div className="empty"></div><div className="empty w-50"></div></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty w-50"></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td>
                        </tr> 
                        <tr>
                            <td><span></span></td><td><span><div className="d-flex w-100 flex-wrap align-items-center"><div className="empty w-50"></div><div className="empty"></div></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td>
                        </tr> 
                        <tr>
                            <td><span></span></td><td><span><div className="d-flex w-100 flex-wrap align-items-center"><div className="empty w-50"></div><div className="empty"></div></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty w-50"></div></span></td><td><span><div className="empty"></div></span></td>
                            <td><span><div className="empty"></div></span></td>
                        </tr> 
                    </tbody> 
                }
            </Table>
        </Form>   

        {/* pagination */}
        { listPagination.totalPages > 0 && <CustomPagination totalPages={listPagination?.totalPages} page={page} href={"/my-business/articles/p"}/> }
        
        {/* footer widget */}
        <Footer options={["archive"]} selectedCheckboxes={selectedCheckboxes} toggleAllCheckboxes={toggleAllCheckboxes} 
            checkboxes={items} archived={props.archived} updateData={updateData}/>

        {/* modal: confirm delete item */}
        <CustomModal modal={openModal} onClose={onModalClose} updateData={updateData}/>
        </>
    )
}   

export default ArticlesTable;