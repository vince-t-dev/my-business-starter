import React, { useEffect, useState } from "react";
import { Button, Row, Col, Form, Card, Dropdown, Spinner, Table, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import DateTimePicker from "../../DateTimePicker";
import CustomSelect from "../../Select";
import moment from "moment";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import { useSite } from "../../../context/site"; 

// step 2: event dates, tickets, and location
function ArticleExtra(props) {
    const form = props.form;
    const [item, setItem] = useState(props.item);
    const [jsonData, setJsonData] = useState(props.jsonData)
    const [newEventReps, setNewEventReps] = useState([]);
    // TODO: update repeat cycle/duration on select change?
    const [enableRepeat, setEnableRepeat] = useState(false);
    const [repeatDuration, setRepeatDuration] = useState({label: 5, value: 5});
    const [repeatCycle, setRepeatCycle] = useState({label: "Daily", value: "days"});
    // current location logic: Online > LocationTitle > Default
    const [eventLocation, setEventLocation] = useState(() => {
        if (props.item?.Online) return "Online";
        return props.item?.LocationTitle ? "Address" : "Default";
    });
    const [eventLocationOptions, setEventLocationOptions] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [selectedUserGroups, setSelectedUserGroups] = useState(props.item?._embedded?.RestrictedGroups || []);
    const [saveAddress, setSaveAddress] = useState(false);
    const [ticketProducts, setTicketProducts] = useState([]);
    const [openModal, setOpenModal] = useState(null);
    const updateData = props.updateData;

    let auth = useAuth();
    let site = useSite();

    // handle event repetitions
    let event_rep_schema = {
        Id: "rep-"+Math.floor(Math.random() * 9999) + 1,
        StartDate: moment().format("YYYY-MM-DD HH:00"), 
        StartTime: moment().format("HH:00"), 
        EndTime: moment().format("HH:30"),
        Active: true,
        Rescheduled: false,
        TicketsSold: "-",
        SeatsRemaining: "-",
        isNew: true
    };
    // add new event rep schema
    const addEventRepetition = () => {
        setNewEventReps([...newEventReps, event_rep_schema]);
    }
    // confirm add new event rep
    const confirmAddEventRepetition = () => {
        let event_reps = item?._embedded?.EventRepetitions || [];
        let updated_event_reps = event_reps.concat(newEventReps);  
        updateData("_embedded.EventRepetitions", updated_event_reps);
        setNewEventReps([]);
    }
    // cancel add new event rep
    const cancelAddEventRepetition = () => {
        setNewEventReps([]);
    }
    // handle individual rep change
    const handleEventRepChange = (name,value,id) => {
        let event_reps = item?._embedded?.EventRepetitions || [];
        let event_rep = event_reps.filter(event => event.Id == id)[0] || []; 
        if (!event_rep["isNew"]) event_rep["isDirty"] = true;
        event_rep[name] = value;
        site.useUpdateObject(jsonData,"_embedded.EventRepetitions",event_reps);
        updateData("_embedded.EventRepetitions", event_reps);
        props.setDirty(true);
    }
    // update event reps
    const updateEventReps = (rep,id) => {
        let event_reps = item?._embedded?.EventRepetitions || [];
        let updated_reps = event_reps.map(event => {return (event.Id == id) ? {...event,...rep} : event});  
        site.useUpdateObject(jsonData,"_embedded.EventRepetitions",updated_reps);
        updateData("_embedded.EventRepetitions", updated_reps);
        props.setDirty(true);
    }
    // delete event rep
    const deleteEventRepetition = (i) => {
        let updated_reps = item?._embedded?.EventRepetitions;
        updated_reps.splice(i, 1);
        updateData("_embedded.EventRepetitions", updated_reps);
    }
    // handle repeat features
    const repeatNewEvents = () => {
        if (enableRepeat) {
            // reset newEventReps state 
            if (newEventReps.length > 1) setNewEventReps(newEventReps.splice(0,1));
            let new_repeated_event_reps = [];
            for (let i=0;i<repeatDuration.value;i++) {
                // increment date based on settings
                let start_date = new_repeated_event_reps[0] ? new_repeated_event_reps[new_repeated_event_reps.length-1].StartDate : newEventReps[0].StartDate;  
                let new_start_date = moment(start_date, "YYYY-MM-DD HH:mm").add(1, repeatCycle.value);
                new_repeated_event_reps?.push({
                    Id: "rep-"+Math.floor(Math.random() * 9999) + 1,
                    StartDate: moment(new_start_date).format("YYYY-MM-DD HH:mm"), 
                    StartTime: newEventReps[0]?.StartTime, 
                    EndTime: newEventReps[0]?.EndTime, 
                    Active: newEventReps[0]?.Active == true ? true : false,
                    Rescheduled: newEventReps[0]?.Rescheduled == true ? true : false,
                    TicketsSold: "-",
                    SeatsRemaining: "-",
                    isNew: true
                });
            }
            setNewEventReps(prevEventReps => [...prevEventReps].concat(new_repeated_event_reps));
        } else {
            setNewEventReps(newEventReps.splice(0,1));
        }
    }
    // hooks: update repeat settings
    site.useUpdateEffect(()=> {
        repeatNewEvents();
    },[enableRepeat,repeatCycle,repeatDuration]);

    // handle changes to fields in new event modal
    const handleNewEventRepsChange = (name,value,id) => {  
        newEventReps[0][name] = value;
    }
    // generate repeat durations dropdown
    let repeat_durations = [];
    for (let i=1;i<26;i++) repeat_durations.push({"label": i, "value": i});
    // add a minimum of one event rep to form
    //useEffect(() => {
        //if (!item?._embedded?.EventRepetitions?.length) item?._embedded?.EventRepetitions?.push(event_rep_schema);
    //},[item?._embedded?.EventRepetitions]); 

    // handle online field
    site.useUpdateEffect(() => {
        updateData("Online", eventLocation == "Online");
    },[eventLocation]);

    // handle usergroups
    const getSelectedUserGroups = (e,checkboxes) => {
        let selected_checkbox = checkboxes.find(a => a.Id == e.target.value);
        if (e.target.checked) {
            selected_checkbox.checked = true;
            if (!selectedUserGroups?.filter(checkbox => checkbox.Id == selected_checkbox.Id).length) setSelectedUserGroups(arr => [...arr, selected_checkbox]);
        } else {
            selected_checkbox.checked = false;
            setSelectedUserGroups(selectedUserGroups?.filter(checkbox => checkbox.Id != selected_checkbox.Id));
        }
    }
    const removeCheckbox = id => {
        setSelectedUserGroups(selectedUserGroups?.filter(checkbox => checkbox.Id != id));
    }
    // usergroups: update json data with changes
    site.useUpdateEffect(() => {
        site.useUpdateObject(jsonData,"_embedded.RestrictedGroups",selectedUserGroups);
        props.setDirty(true);
    },[selectedUserGroups]);

    // on load
    useEffect(() => {
        // pre-load ticket products for dropdown
        const get_ticket_products = async (options) => {
            const ticket_products = await axios.get("/__xpr__/pub_engine/my-business-starter/element/event_products_json", {
                headers: { 
                    Auth: auth.user.token,
                    "Content-Type": "application/json" 
                },
                withCredentials: true
            });
            setTicketProducts(ticket_products?.data);
        }
        get_ticket_products();

        // get location options
        const get_location_options = async (options) => {
            let location_params = {
                action: "getData",
                uri: "/customFields/listOptions/",
                params: {
                    TagDefinitionId__eq: site.siteConfig.EventLocationId
                }
            }
            const location_options = await axios.post("/__xpr__/pub_engine/my-business-starter/element/ajax_handler",JSON.stringify(location_params), {
                headers: { 
                    Auth: auth.user.token,
                    "Content-Type": "application/json" 
                },
                withCredentials: true
            });
            setEventLocationOptions(location_options?.data);
        }
        get_location_options();

         // get user groups
         const get_user_groups = async (options) => {
            let user_group_params = {
                action: "getData",
                uri: "/userGroups/",
                params: {_noUnhydrated: 1}
            }
            const user_groups = await axios.post("/__xpr__/pub_engine/my-business-starter/element/ajax_handler",JSON.stringify(user_group_params), {
                headers: { 
                    Auth: auth.user.token,
                    "Content-Type": "application/json" 
                },
                withCredentials: true
            });
            setUserGroups(user_groups?.data);
        }
        get_user_groups();
    },[]); 

    // modal method
    const onModalClose = e => setOpenModal(false);

    return (
        <>
        { props.step == 2 &&
        <Row className="mb-5">
            <Col sm={9}>
                <Card border="light" className="shadow-sm">
                    <Card.Body className="p-5">

                        {/* location */}
                        <Row className="justify-content-between">
                            <Col sm={8} className="mb-3">
                                <h3 className="text-grape">EVENT LOCATION</h3>
                            </Col>
                        </Row>
                        <Row className="align-items-end">
                            <Col sm={8}>
                                <Form.Label className="text-grape">Location</Form.Label>
                                <Form.Text className="text-grape opacity-50 ms-0">{eventLocation == "Default" && (item?._embedded?.CustomFields?._embedded?.EventLocation?.Value || "Default Address")} {eventLocation == "Address" && item?.LocationTitle}</Form.Text>
                            </Col>
                            <Col className="d-flex justify-content-end">
                                <Form.Check inline label="Default" name="eventLocation" value="Default" type="radio" defaultChecked={!item?.Online && !item?.LocationTitle} id="location-1" onChange={e => setEventLocation(e.target.value)}/>
                                <Form.Check inline label="Address" name="eventLocation" value="Address" type="radio" defaultChecked={!item?.Online && item?.LocationTitle} className="mx-3" id="location-2" onChange={e => setEventLocation(e.target.value)}/>
                                <Form.Check inline label="Online" name="eventLocation" value="Online" type="radio" defaultChecked={item?.Online} id="location-3" onChange={e => setEventLocation(e.target.value)}/>
                            </Col>
                        </Row>
                        {/* address list */}
                        {eventLocation == "Default" && 
                        <Row className="mt-3">
                            <Col sm={6}>
                                <CustomSelect name="eventLocation" 
                                    options={eventLocationOptions}
                                    onSelectChange={item => { updateData("_embedded.CustomFields._embedded.EventLocation", item); } } 
                                    // re-format to map value with id (for xpr cf options)
                                    value={props.item?._embedded?.CustomFields?._embedded?.EventLocation
                                        ? {
                                        label: props.item?._embedded?.CustomFields?._embedded?.EventLocation?.Value,
                                        value: props.item?._embedded?.CustomFields?._embedded?.EventLocation?.Id }
                                        : ""
                                }/>
                            </Col>
                        </Row>}
                        {/* address form */}
                        {eventLocation == "Address" &&
                        <>
                        <Row className="mt-3">
                            <Col sm={6}>
                                <Form.Label>Location Title</Form.Label>
                                <Form.Control type="text" name="LocationTitle" value={item?.LocationTitle || ""} onChange={e => updateData(e.target.name,e.target.value)} className="mb-2"></Form.Control>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={3}>
                                <Form.Label>Address</Form.Label>
                                <Form.Control type="text" name="Address" value={item?.Address || ""} onChange={e => updateData(e.target.name,e.target.value)} className="mb-2"></Form.Control>
                            </Col>
                            <Col sm={3}>
                                <Form.Label>City</Form.Label>
                                <Form.Control type="text" name="City" value={item?.City || ""} onChange={e => updateData(e.target.name,e.target.value)} className="mb-2"></Form.Control>
                            </Col>
                        </Row>
                        <Row className="align-items-center">
                            <Col sm={3}>
                                <Form.Label>Postal Code</Form.Label>
                                <Form.Control type="text" name="PostalCode" value={item?.PostalCode || ""} onChange={e => updateData(e.target.name,e.target.value)} className="mb-2"></Form.Control>
                            </Col>
                            <Col sm={3}>
                                <Form.Group controlId="save-address">
                                    <Form.Check label="Save address" inline checked={saveAddress} onChange={e => {setSaveAddress(e.target.checked);updateData("saveAddress",e.target.checked ? site.siteConfig.EventLocationId : false)}}/>
                                </Form.Group>
                            </Col>    
                        </Row>
                        </>}
                        {/* online url form */}
                        {eventLocation == "Online" &&
                        <Row>
                            <Col sm={6}>
                                <Form.Label>Website URL (zoom, meet, etc.)</Form.Label>
                                <Form.Control type="text" name="URL" value={item?.URL || ""} onChange={e => updateData(e.target.name,e.target.value)} className="mb-2"></Form.Control>
                            </Col>
                        </Row>}

                        {/* event repetitions */}
                        <Row className="justify-content-between mt-5">
                            <Col sm={8} className="mb-3">
                                <h3 className="text-grape">EVENT REPETITION</h3>
                                <p className="subheading-1">in this area you can find all scheduled events or create new one</p>
                            </Col>
                        </Row>

                        <Row className="mb-2">
                            <Col>
                                {/* event repetitions table */}
                                <Table responsive="sm">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Tickets Sold</th>
                                            <th>Rem. Seats</th>
                                            <th>Published</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {item?._embedded?.EventRepetitions?.map((a,index) => (
                                        <tr key={"list-"+a.Id}>
                                            <td>
                                                <span>
                                                    {moment(a.StartDate).format("MMM") + " " + moment(a.StartDate).format("DD") + ", " + moment(a.EndDate).format("YYYY")}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {a.StartTime ? a.StartTime : (a.StartDate?.split(" ")[1]?.length == 8) ? a.StartDate?.split(" ")[1]?.slice(0,-3) : a.StartDate?.split(" ")[1]}
                                                </span>    
                                            </td>
                                            {/* data structure between event reps api vs widget design is very very inconsistent */}
                                            <td>
                                                <span>
                                                    {a.EndTime ? a.EndTime : (a.EndDate?.split(" ")[1]?.length == 8) ? a.EndDate?.split(" ")[1]?.slice(0,-3) : a.EndDate?.split(" ")[1]}
                                                </span>
                                            </td>
                                            <td><span className="justify-content-start">{a.TicketsSold}</span></td>
                                            <td><span className="justify-content-start">{a.SeatsRemaining}</span></td>
                                            <td>
                                                <span>
                                                    <Form.Check type="switch" name="Active" value={a.Id} checked={a.Active == true ? true : false} onChange={e => handleEventRepChange("Active",e.target.checked,a.Id)} id={"switch-status-"+a.Id}/>
                                                </span>
                                            </td>
                                            <td>
                                                <span className="justify-content-end">
                                                    <div className="btn-group">
                                                        <OverlayTrigger overlay={<Tooltip>Preview</Tooltip>}>
                                                            <Link to={"/my-business/events-by-date/view/"+a.Id} state={{item: a}} target="_blank" className="btn btn-link"><i data-toggle="tooltip" className="xpri-eye-alt"></i></Link>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
                                                            <Button type="button" variant="link" onClick={e => setOpenModal({type:"edit-event-rep", item: a, skipAPICall: true})}><i data-toggle="tooltip" className="xpri-add-new"></i></Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                                                            <Button variant="link" className="p-0" onClick={e => deleteEventRepetition(index)}><i className="xpri-trash"></i></Button>
                                                        </OverlayTrigger>
                                                    </div>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}   
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>

                        <div className="border dotted border-primary rounded-3 py-2 my-3 text-center">
                            <Button variant="outline-primary" className="rounded-circle" onClick={addEventRepetition}><i className="xpri-plus"></i></Button>
                        </div>

                        <hr className="mt-4"/>
                        
                        {/* event status */}
                        <Row className="mb-4">
                            <Col sm={1}>
                                <Form.Label className="text-grape">Status</Form.Label>
                                <Form.Check name="Published" type="switch" defaultChecked={item.Published} id={"switch-status-"+item.Id} onChange={e => updateData(e.target.name,e.target.checked)}/>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col sm={2}>
                                <Form.Label className="text-grape">Restricted Event</Form.Label>
                                <Form.Check name="IsUserGroupRestricted" type="switch" defaultChecked={item.IsUserGroupRestricted} id={"switch-restricted-"+item.Id} onChange={e => updateData(e.target.name,e.target.checked)}/>
                            </Col>
                        </Row>
                        
                        {/* user groups */}
                        <Row className="mb-4">
                            <Col sm={12}><Form.Label className="text-grape">Restricted Groups</Form.Label></Col>
                            <Col sm={3}>
                                <Dropdown className="multi-select">
                                    <Dropdown.Toggle bsPrefix="form-select justify-content-between" as={Col}>Select <i className="xpri-caret text-gray-700 font-xs"></i></Dropdown.Toggle>
                                    <Dropdown.Menu bsPrefix="dropdown-menu px-2 py-3">
                                        <nav className="scrollbar overflow-auto">
                                            {userGroups?.map((c,index) => (
                                            <Form.Group controlId={c.Id} key={index}>
                                                <Form.Check label={c.Name} inline checked={selectedUserGroups?.filter(checkbox => checkbox.Id == c.Id).length} onChange={e => {getSelectedUserGroups(e,userGroups)}} value={c.Id}/>
                                            </Form.Group>))}
                                        </nav>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                            <Col>
                                <Form.Group className="mb-4">
                                    <section className="tags mb-4">
                                        {selectedUserGroups?.map((el,index) => (
                                        <Button variant="outline-gray-700" key={index}>
                                            <Form.Control type="button" plaintext htmlSize={el.Name?.length < 11 ? 11 : el.Name?.length} name={el.Name} value={el.Name}></Form.Control>
                                            <i className="xpri-trash text-gray" onClick={e => removeCheckbox(el.Id)}></i>
                                        </Button>
                                        ))}
                                    </section>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* tickets */}
                        <Row>
                            <Col sm={8} className="mb-3">
                                <h2 className="heading-2">Ticket Options</h2>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-grape">Current Ticket</Form.Label>
                                    <CustomSelect searchable={true} 
                                        options={ticketProducts}
                                        search_url="/__xpr__/pub_engine/my-business-starter/element/event_products_json" 
                                        onSelectChange={item => { updateData("_embedded.Product", item); } } 
                                        value={item?._embedded?.Product}
                                        isClearable={false}
                                        />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col sm={3}>
                                <Form.Label>Price</Form.Label>
                                <Form.Control type="text" name="Price" value={new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format( Number(item?._embedded?.Product?._embedded?.ProductVariants[0]?.RetailPrice || 0).toFixed(2) )} readOnly className="mb-2"></Form.Control>
                            </Col>
                            <Col sm={3}>
                                <Form.Label>No. of Tickets</Form.Label>
                                <Form.Control type="text" name="SeatsAvailable" value={item?.SeatsAvailable} onChange={e => updateData(e.target.name,e.target.value)} className="mb-2"></Form.Control>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col className="d-flex justify-content-end">
                                <Button variant="primary" type="submit" className="shadow">
                                    { props.isSaved ? "Save" : "Saving" } { !props.isSaved && <Spinner animation="border" variant="white" size="sm" className="ms-2"/> }
                                </Button>
                            </Col>
                        </Row>
                        {/*<Row className="mt-3">
                            <Col className="d-flex justify-content-end">
                                <Button variant="gray-700" type="button" onClick={e => props.handleStepChange("decrement")} className="me-4">
                                    BACK
                                </Button>
                                <Button variant="primary" type="submit" className="shadow">
                                    NEXT <i className="xpri-arrow-right ms-2"></i>
                                </Button>
                            </Col>
                        </Row>*/}
                    </Card.Body>
                </Card>
            </Col>
        </Row>}

        {/* modal: new event rep with repeating features */}
        <Modal size="md" centered show={newEventReps.length > 0} onHide={cancelAddEventRepetition}>
            <Form onSubmit={form.handleSubmit}>
                <Modal.Header closeButton closeVariant="white"> 
                    <Modal.Title>Add Event Repetition</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-5 px-4">

                    <Form.Group as={Row} controlId="Date" className="align-items-center mb-3">
                        <Form.Label column sm="4" className="font-sm fw-bold text-capitalize">Date:</Form.Label>            
                        <Col sm="6">
                            <DateTimePicker name="StartDate" value={moment().format("YYYY-MM-DD HH:mm")} size="sm" onChange={handleNewEventRepsChange}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="StartTime" className="align-items-center mb-3">
                        <Form.Label column sm="4" className="font-sm fw-bold text-capitalize">Time Slot:</Form.Label>
                        <Col sm="8">
                            <Row className="align-items-center">
                                <Col sm="5">
                                    <DateTimePicker name="StartTime" value={moment().format("YYYY-MM-DD HH:00")} viewMode="time" size="sm" onChange={handleNewEventRepsChange}/>
                                </Col>
                                <Form.Label column sm="1" className="font-sm fw-bold text-capitalize text-center px-0">To</Form.Label>
                                <Col sm="5">
                                    <DateTimePicker name="EndTime" value={moment().format("YYYY-MM-DD HH:30")} viewMode="time" size="sm" onChange={handleNewEventRepsChange}/>
                                </Col>
                            </Row>
                        </Col>
                    </Form.Group>
                    <Row className="align-items-center mb-3">
                        <Form.Label column sm="4" className="font-sm fw-bold text-capitalize text-nowrap py-0">Status:</Form.Label>
                        <Col sm="6">
                            <Form.Check name="Active" type="switch" defaultChecked={true} id="switch-status" onChange={e => handleNewEventRepsChange("Active",e.target.checked)}/>
                        </Col>
                    </Row>
                    <Row className="align-items-center mb-3">
                        <Form.Label column sm="4" className="font-sm fw-bold text-capitalize text-nowrap py-0">Rescheduled:</Form.Label>
                        <Col sm="6">
                            <Form.Check name="Rescheduled" type="switch" defaultChecked={false} id={"switch-rescheduled"} onChange={e => handleNewEventRepsChange("Rescheduled",e.target.checked)}/>
                        </Col>
                    </Row>

                    {/* repeating controls */}
                    <Row className="align-items-center mb-3">
                        <Form.Label column sm="4" className="font-sm fw-bold text-capitalize text-nowrap py-0">Repeat:</Form.Label>
                        <Col sm="6">
                            <Form.Check name="Repeat" type="switch" defaultChecked={false} id="switch-repeat" onChange={e => setEnableRepeat(e.target.checked ? true : false)}/>
                        </Col>
                    </Row>
                    {enableRepeat && 
                    <>
                    <Row className="align-items-center mb-3">
                        <Form.Label column sm="4" className="font-sm fw-bold text-capitalize text-nowrap py-0">Frequency:</Form.Label>
                        <Col sm="4">
                            <CustomSelect name="RepeatCycle" size="sm" options={[{label: "Daily", value: "days"},{label: "Weekly", value: "weeks"},{label: "Monthly", value: "months"}]} onSelectChange={setRepeatCycle} value={repeatCycle} isClearable={false}/>
                        </Col>
                    </Row>
                    <Row className="align-items-center mb-3">
                        <Form.Label column sm="4" className="font-sm fw-bold text-capitalize text-nowrap py-0">No. of Times:</Form.Label>
                        <Col sm="4">
                            <CustomSelect name="RepeatDuration" size="sm" options={repeat_durations} onSelectChange={setRepeatDuration} value={repeatDuration}  isClearable={false}/>
                        </Col>
                    </Row>
                    </>}
                </Modal.Body>
                <Modal.Footer className="justify-content-center p-4">
                    <Button variant="secondary" size="sm" type="button" onClick={cancelAddEventRepetition}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="button" onClick={confirmAddEventRepetition}>
                        Update
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
        </>
    )
}

export default ArticleExtra;