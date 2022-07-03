import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../context/auth";

function CustomModal(props) {
    // modal state/method
    const [modal, setModal] = useState(props.modal);
    const [isLoaded, setIsLoaded] = useState(true);
    const [error, setError] = useState("");
    const handleModalClose = () => {
        setModal(false);
        props.onClose?.(false);
    }

    // watch for props change
    useEffect(() => {
        setModal(props.modal);
    }, [props]);

    // submit
    let auth = useAuth();
    const handleSubmit = () => {
        let formData = {};
        setIsLoaded(false);

        // delete articles
        if (modal?.type == "delete-articles") {
            modal?.data?.map(a => {
                formData.action = "deleteData";
                formData.uri = "/articles/"+a.Id;
                fetch(`/__xpr__/pub_engine/my-business-starter/element/ajax_handler`, {
                    method: "POST",
                    headers: { Auth: auth.user.token },
                    body: JSON.stringify(formData)
                })
                .then(res => res.json())
                .then(data => {
                    setIsLoaded(true);
                    props.updateData(a.Id);
                })
                .then((error) => setError(error))
            });
        }
    }

    return (
        <>
        {/* modal: saved */}
        <Modal centered show={modal?.type == "content-saved"} backdrop="static" onHide={handleModalClose} contentClassName="bg-transparent shadow-none" size="md">
            <Modal.Body className="bg-white">
                <div className="text-center my-5">
                    <div className="mb-4"><i className="xpri-check-circle icon-xl text-gray-700"></i></div>
                    <h3>Content has been saved successfully</h3>
                </div>
            </Modal.Body>
        </Modal>

        {/* modal: delete item */}
        <Modal centered show={modal?.type == "delete"} onHide={handleModalClose} size="md"> 
            <Modal.Header closeButton closeVariant="white"> 
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete:</p>
                <ul>
                    { modal?.data && 
                    <li dangerouslySetInnerHTML={{__html: modal?.data?.Title || modal?.data?.Name || modal?.data?.FirstName || modal?.data?._embedded?.Person?.FirstName || "Id: "+modal?.data?.Id }}></li>
                    }
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleModalClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Confirm { !isLoaded ? <Spinner animation="border" variant="white" size="sm" className="ms-2"/> : "" }
                </Button>
            </Modal.Footer>
        </Modal>

        {/* modal: delete articles */}
        <Modal centered show={modal?.type == "delete-articles"} onHide={handleModalClose} contentClassName="bg-transparent shadow-none" size="lg">
            <Modal.Header closeButton closeVariant="white"> 
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-white text-center">
                <div className="text-center mb-4">
                    <i className="xpri-warning-triangle icon-xl text-light"></i>
                </div>
                <p className="text-center">Your are about to <b className="text-danger">Delete</b> articles.<br/> 
                Are you sure you want to proceed?<br/></p>
                <ul className="d-inline-block mt-3 my-0"> 
                    {modal?.data?.map((a,index) => (
                        <li key={"li-"+a.Id} dangerouslySetInnerHTML={{__html: a.Title || "Id: "+a.Id }}></li>
                    ))}
                </ul>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleSubmit}>
                        Confirm { !isLoaded ? <Spinner animation="border" variant="white" size="sm" className="ms-2"/> : "" }
                    </Button>
                </Modal.Footer>
            </Modal.Body>
        </Modal>
        </>
    );
}

export default CustomModal;