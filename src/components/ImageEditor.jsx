import React, { useState, useEffect } from "react";
import { Row, Col, Form, Card, Button, Spinner } from "react-bootstrap";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useAuth } from "../context/auth";
import axios from "axios";

function ImageEditor(props) {
    let auth = useAuth();
    // cropper js
    // media zoom
    const [cropper, setCropper] = useState();
    const [enableCrop, setEnableCrop] = useState(false);
    const [image, setImage] = useState(props.value);
    const [imageData, setImageData] = useState();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const zoomMedia = e => {
        let target = e.target;
        const min = target.min;
        const max = target.max;
        const val = target.value;
        target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%';
        cropper.zoomTo(val);
    }
    
    // convert base64 to blob
    function base64ToBlob(base64, mime) {
        mime = mime || "";
        var sliceSize = 1024;
        var byteChars = window.atob(base64);
        var byteArrays = [];
        for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) { var slice = byteChars.slice(offset, offset + sliceSize);var byteNumbers = new Array(slice.length);for (var i = 0; i < slice.length; i++) { byteNumbers[i] = slice.charCodeAt(i); }var byteArray = new Uint8Array(byteNumbers);byteArrays.push(byteArray); }
        return new Blob(byteArrays, {type: mime});
    }

    // on media change
    const onChange = e => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) 
            files = e.dataTransfer.files;
        else if (e.target)
            files = e.target.files;
        const reader = new FileReader();
        reader.onload = () => {
            setImageData(reader.result);
            // upload to server
            uploadFile(reader.result,files[0].name,files[0].type);
        };
        reader.readAsDataURL(files[0]);
    };
    
    // on crop
    const crop = () => {
        if (typeof cropper !== "undefined") {
            let crop_data = cropper.getCroppedCanvas().toDataURL();
            // upload to server
            uploadFile(crop_data,image.Name,image.Type);
            // update crop data and image preview
            cropper.replace(crop_data);
            setImageData(crop_data);
            setEnableCrop(false);
        }
    };

    // upload file
    const uploadFile = (file,file_name,file_type) => { 
        // get blob data
        let base64_image_content = file.replace(/^data:image\/(png|jpg|jpeg|webp|svg+xml);base64,/, "");
        let image_to_upload = base64ToBlob(base64_image_content, file_type);   
        // upload file
        let formData = new FormData();
        let random_id = Math.floor(Math.random() * 9999) + 1;
        formData.append("overwrite",0);
        formData.append("unzip",0);
        formData.append("files[]",image_to_upload,file_name);  
        setShowSpinner(true);
        axios.post("/api/files/",formData, {
            headers: { 
                "xpr-token-backend": auth.user.token,
                "x-xsrf-token": auth.user.xsrf_token,
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true
        })
        .then(function(response) {
            props.onChange(props.name, response.data);
            setImage(response.data);
            setShowSpinner(false);
        });
    }

    return (
        <>    
            <Card className="media-wrapper">
                <div className="image-container d-flex align-items-center justify-content-center">
                    {image && 
                        <>
                        <img src={imageData ? imageData : `${(image?.Type && image?.Type == "image/svg" || image?.Type == "image/webp") ? image?.SourcePath : "/media/1500x999/"+image?.Name}`} className={`${enableCrop ? "d-none" : "image-preview"} ${imageLoaded ? "opacity-100" : "opacity-0"}`} onLoad={() => { setImageLoaded(true)}}/>
                        <div className={enableCrop ? "" : "invisible"}>
                            <Cropper
                                src={imageData ? imageData : `${(image?.Type && image?.Type == "image/svg" || image?.Type == "image/webp") ? image?.SourcePath : "/media/1500x999/"+image?.Name}`}
                                autoCrop={true}
                                autoCropArea={0}
                                style={{ height: 300, width: "100%" }}
                                //initialAspectRatio={16 / 9}
                                guides={false}
                                background={false}
                                dragMode={"crop"}
                                viewMode={2}
                                onInitialized={(instance) => {
                                    setCropper(instance);
                                }}
                            />
                        </div>
                        </>
                    }
                    {showSpinner && <Spinner animation="border" variant="dark" size="md"/>}
                </div>
                <Card.Footer>
                    <Row className="align-items-center justify-content-between">
                        <Col></Col>
                        <Col xs={6} className="text-center">
                            <Form.Range defaultValue="0.5" min="0" max="1" step="0.0001" onChange={zoomMedia} className={enableCrop ? "d-inline" : "d-none"}/>
                        </Col>
                        <Col className="d-flex align-items-center justify-content-end">
                            <Form.Group controlId="crop">
                                <Button variant="primary" className={(enableCrop || !image) ? "d-none" : "icon"} onClick={setEnableCrop}>
                                    <i className="xpri-pencil"></i>
                                </Button>
                                <Button variant="primary" className={enableCrop ? "icon bg-cherry" : "d-none"} onClick={e => { setEnableCrop(false) }}>
                                    <i className="xpri-close text-white font-sm"></i>   
                                </Button>
                                <Button variant="primary" className={enableCrop ? "icon bg-green ms-2" : "d-none"} onClick={crop}>
                                    <i className="xpri-check text-white"></i>
                                </Button>
                            </Form.Group>
                            <Form.Group controlId="picture-1">
                                <Form.Label className="btn btn-primary icon m-0 ms-2"><i className="xpri-image text-white"></i></Form.Label>
                                <Form.Control type="file" onChange={onChange} className="d-none"/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Footer>
            </Card>
        </>
    );
}

export default ImageEditor;