import React, { useState } from "react";
import { Stack, Col, Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import CustomModal from "./Modal";

export default (props) => {
    // modals
    const [openModal, setOpenModal] = useState(null);
    const onModalClose = e => setOpenModal(false);

    // toggle check all checkboxes
    const [checkAll, setCheckAll] = useState(true);

    // status
    const updateSwitch = status => {
        props.selectedCheckboxes.map(a => {
            a.checked = status;
            if (props.handleStatusChange) props.handleStatusChange(a);
            document.getElementById("switch-status-"+a.Id).checked = status;
        });
    }
    const toggleStatus = status => {
        updateSwitch(status == "Publish" ? true : false);
    }  

  	return (
    	<>
        {<footer className={"footer py-3 px-4 "+ (props.selectedCheckboxes?.length ? "active": "")}>
            <Stack direction="horizontal" gap={3} className="d-flex justify-content-center">
                <Col sm={2} className="text-sm-left text-dark">
                    <b>{props.selectedCheckboxes?.length}</b> items selected
                </Col>

                <ButtonGroup className="mx-auto">
                    {/* options list */}

                    {/* status */}
                    {props.options?.indexOf("status") > -1 && 
                    <>
                    <div className="vr"/>
                    <Button type="button" variant="link" className="btn" onClick={e => toggleStatus("Publish")}>
                        {/*<FontAwesomeIcon icon={faToggleOn} size="xl" className=" m-0 mx-5 mb-1 font-xl d-block"/>*/}
                        <small className="font-xs">Publish</small>
                    </Button>
                    <div className="vr"/>
                    <Button type="button" variant="link" className="btn" onClick={e => toggleStatus("Unpublish")}>
                        {/*<FontAwesomeIcon icon={faToggleOff} size="xl" className=" m-0 mx-5 mb-1 font-xl d-block"/>*/}
                        <small className="font-xs">Unpublish</small>
                    </Button>
                    </>}

                    {/* delete articles */}
                    {props.options?.indexOf("delete-articles") > -1 && 
                    <>
                    <div className="vr"/>
                    <Button type="button" variant="link" className="btn" onClick={e => setOpenModal({type:"delete-articles", data: props.selectedCheckboxes})}>
                        <i className="xpri-trash m-0 mx-5 mb-1 font-xl d-block"></i>
                        <small className="font-xs">Delete</small>
                    </Button>
                    </>}

                    {/* select all */}
                    <div className="vr"/>
                    <ToggleButton
                        id="toggle-select-all"
                        type="checkbox" variant="link" className="btn" checked={!checkAll}
                        onChange={e => {props.toggleAllCheckboxes(e,props.checkboxes);setCheckAll(!checkAll)}}
                        >
                            <i className="xpri-select-all m-0 mx-5 mb-1 font-xl d-block"></i>
                            <small className="font-xs">{(props.selectedCheckboxes?.length == props.checkboxes?.length) ? "Unselect" : "Select"} all</small>
                    </ToggleButton>
                    <div className="vr"/>

                </ButtonGroup>

                <Col sm={2}></Col>
            </Stack>

            <CustomModal modal={openModal} onClose={onModalClose} updateData={props.updateData}/>

        </footer>}
        </>
    );
};
