import React, { useState, useEffect } from "react";
import { Form, Row, Col, Card, Tab, Nav, InputGroup, OverlayTrigger, Tooltip, Accordion } from "react-bootstrap";
import MaskedInput from "./MaskedInput"; 
import CustomSelect from "./Select";
import creditCardType from "credit-card-type";
import axios from "axios";
import { useAuth } from "../context/auth";

function PaymentForm(props) {
    // form
    const form = props.form;

    // payment tabs
    const tabPaymentKey = props.tabPaymentKey;
    const handleTabPaymentKey = props.handleTabPaymentKey;

    // determining a credit card type
    const [cardNumber, setCardNumber] = useState("");
    /*const [cardTypeImage, setCardTypeImage] = useState(faCreditCard);
    const handleCardNumber = (e) => {
        e.preventDefault();
        const value = e.target.value;
        setCardNumber(value);
        let suggestion;
        if (value.length > 0) suggestion = creditCardType(e.target.value)[0];
        const cardType = suggestion ? suggestion.type : "unknown";    
        let imageUrl;
        switch (cardType) {
            case "visa":
                imageUrl = faCcVisa;
            break;
            case "mastercard":
                imageUrl = faCcMastercard;
            break;
            case "american-express":
                imageUrl = faCcAmex;
            break;
            default:
                imageUrl = faCreditCard;
        }
        setCardTypeImage(imageUrl);
    };*/
    
    // populate countries/regions
    let auth = useAuth();  
    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const get_countries = async (values) => {
        let formData = {
            action: "getData",
            uri: "/store/countries/",
            params: {
                _noUnhydrated: 1,
                Active__eq: true,
                with: "CountryRegions",
                order_Country_CountryRegions_field: "Name"
            }
        }
        const response = await axios.post(`/__xpr__/pub_engine/my-business-starter/element/ajax_handler`,JSON.stringify(formData), {
            headers: { 
                Auth: auth.user.token,
                "Content-Type": "application/json" 
            },
            withCredentials: true
        });
        // result
        let result = response;
        if (result) setCountries(result.data);
    }

    // init on page load
    useEffect(() => {
        get_countries();
    },[]);

    return (
        <>
        {props.step == props.paymentStep && 
            <> 
            {/* payment methods */}
            <Accordion activeKey={tabPaymentKey} onSelect={(k) => {handleTabPaymentKey(k);form.setFieldValue(`payment.method`, k)}}>
                {/* credit card */}
                <Accordion.Item eventKey="tab-cc">
                    <Accordion.Header>CREDIT CARD</Accordion.Header>
                    <Accordion.Body>        
                        <Row className="mb-2">
                            <Col sm={12}>
                                <Form.Label>Card Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="xpri-credit-card text-primary font-xl"></i>
                                    </InputGroup.Text>
                                    <Form.Control as={MaskedInput} mask="1111 1111 1111 1111" placeholderChar=" " placeholder="Credit Card Number" type="text" onChange={e => {form.setFieldValue(`payment.card_number`, e.target.value);handleCardNumber(e);}} value={form?.values?.payment?.card_number} className="bg-transparent"></Form.Control>
                                    <InputGroup.Text className="border-left-0">
                                        <i className="xpri-credit-card font-lg"></i>
                                    </InputGroup.Text>
                                </InputGroup>
                                {form.errors?.payment?.card_number && form.touched.payment && (
                                    <div className="text-danger mt-1">{form.errors.payment?.card_number}</div>
                                )}
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col sm={6}>
                                <Form.Label>Cardholder Name</Form.Label>
                                <Form.Control type="text" placeholder="John Smith" onChange={e => form.setFieldValue(`payment.card_name`, e.target.value)} defaultValue={form?.values?.payment?.card_name} className="bg-transparent"></Form.Control>
                                {form.errors?.payment?.card_name && form.touched.payment && (
                                    <div className="text-danger mt-1">{form.errors.payment?.card_name}</div>
                                )}
                            </Col>
                            <Col sm={3}>
                                <Form.Label>EXP. Date</Form.Label>
                                <Form.Control as={MaskedInput} mask="11/11" placeholderChar=" " placeholder="MM/YY" type="text" onChange={e => form.setFieldValue(`payment.card_expiry`, e.target.value)} value={form?.values?.payment?.card_expiry} className="bg-transparent"></Form.Control>
                                {form.errors?.payment?.card_expiry && form.touched.payment && (
                                    <div className="text-danger mt-1">{form.errors.payment?.card_expiry}</div>
                                )}
                            </Col>
                            <Col sm={3}>
                                <Form.Label>CVC <OverlayTrigger overlay={<Tooltip>Three or four-digit number on the back of your card.</Tooltip>}><i className="xpri-alert"></i></OverlayTrigger></Form.Label>
                                <Form.Control as={MaskedInput} mask="1111" placeholderChar=" " placeholder="CVC" type="text" onChange={e => form.setFieldValue(`payment.card_cvc`, e.target.value)} value={form?.values?.payment?.card_cvc} className="bg-transparent"></Form.Control>
                                {form.errors?.payment?.card_cvc && form.touched.payment && (
                                    <div className="text-danger mt-1">{form.errors.payment?.card_cvc}</div>
                                )}
                            </Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>

                {/* gift card */}
                <Accordion.Item eventKey="tab-gc">
                    <Accordion.Header>GIFT CARD</Accordion.Header>
                    <Accordion.Body>
                        
                        <Row className="mb-2">
                            <Col sm={12}>
                                <Form.Label>Gift Card Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="xpri-credit-card text-primary font-xl"></i>
                                    </InputGroup.Text>
                                    <Form.Control as={MaskedInput} mask="111 111 1111 1111 1111 111" placeholderChar=" " placeholder="Gift Card Number" type="text" onChange={e => {form.setFieldValue(`payment.gift_card_number`, e.target.value);handleCardNumber(e);}} value={form?.values?.payment?.gift_card_number} className="bg-transparent"></Form.Control>
                                </InputGroup>
                                {form.errors?.payment?.gift_card_number && form.touched.payment && (
                                    <div className="text-danger mt-1">{form.errors.payment?.gift_card_number}</div>
                                )}
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col sm={8}>
                                <Form.Label>Amount to Pay</Form.Label>
                                <Form.Control type="text" placeholder={props.amount} onChange={e => form.setFieldValue(`payment.gift_card_amount`, (Number(e.target.value) > Number(props.amount)) ? props.amount : e.target.value)} defaultValue={form?.values?.payment?.gift_card_amount} className="bg-transparent"></Form.Control>
                                {form.errors?.payment?.gift_card_amount && form.touched.payment && (
                                    <div className="text-danger mt-1">{form.errors.payment?.gift_card_amount}</div>
                                )}
                            </Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>

            </Accordion>
            </>
        }

        {props.step == props.billingStep && 
            <Row>
                {/*<h2 className="text-grape mb-3">Billing Information</h2>*/}
                <Col sm={6}>
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control type="text" onChange={e => form.setFieldValue(`billing_address.first_name`, e.target.value)} defaultValue={form?.values?.billing_address?.first_name} className="bg-transparent mb-2"></Form.Control>
                    {form.errors?.billing_address?.first_name && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.first_name}</div>
                    )}
                </Col>
                <Col sm={6}>
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control type="text" onChange={e => form.setFieldValue(`billing_address.last_name`, e.target.value)} defaultValue={form?.values?.billing_address?.last_name} className="bg-transparent mb-2"></Form.Control>
                    {form.errors?.billing_address?.last_name && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.last_name}</div>
                    )}
                </Col>
                <Col sm={6}>
                    <Form.Label>Email *</Form.Label>
                    <Form.Control type="text" onChange={e => form.setFieldValue(`billing_address.email`, e.target.value)} defaultValue={form?.values?.billing_address?.email} className="bg-transparent mb-2"></Form.Control>
                    {form.errors?.billing_address?.email && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.email}</div>
                    )}
                </Col>
                <Col sm={6}>
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control as={MaskedInput} mask="1111111111" placeholderChar=" " type="text" onChange={e => form.setFieldValue(`billing_address.phone`, e.target.value)}  value={form?.values?.billing_address?.phone} className="bg-transparent mb-2"></Form.Control>
                    {form.errors?.billing_address?.phone && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.phone}</div>
                    )}
                </Col>
                <Col sm={12}>
                    <Form.Label>Address *</Form.Label>
                    <Form.Control type="text" onChange={e => form.setFieldValue(`billing_address.street_address`, e.target.value)} defaultValue={form?.values?.billing_address?.street_address} className="bg-transparent mb-2"></Form.Control>
                    {form.errors?.billing_address?.street_address && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.street_address}</div>
                    )}
                </Col>
                <Col sm={12}>
                    <Form.Label>Address (line 2)</Form.Label>
                    <Form.Control type="text" onChange={e => form.setFieldValue(`billing_address.street_address_2`, e.target.value)} defaultValue={form?.values?.billing_address?.street_address_2} className="bg-transparent mb-2"></Form.Control>
                </Col>
                <Col sm={6} className="mb-2">
                    <Form.Label>Country *</Form.Label>
                    <CustomSelect options={countries} onSelectChange={a => { setRegions(a?._embedded?.CountryRegions);form.setFieldValue("billing_address.country",a); } } value={form.values.billing_address?.country}/>
                    {form.errors?.billing_address?.country && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.country}</div>
                    )}
                </Col>
                <Col sm={6} className="mb-2">
                    <Form.Label>Region *</Form.Label>
                    <CustomSelect options={regions} onSelectChange={a => { form.setFieldValue("billing_address.region",a); } } value={form.values.billing_address?.region}/>
                    {form.errors?.billing_address?.region && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.region}</div>
                    )}
                </Col>
                <Col sm={6}>
                    <Form.Label>City *</Form.Label>
                    <Form.Control type="text" onChange={e => form.setFieldValue(`billing_address.city`, e.target.value)} defaultValue={form?.values?.billing_address?.city} className="bg-transparent mb-2"></Form.Control>
                    {form.errors?.billing_address?.city && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.city}</div>
                    )}
                </Col>
                <Col sm={6}>
                    <Form.Label>Postal Code *</Form.Label>
                    <Form.Control as={MaskedInput} mask="A1A 1A1" placeholderChar=" " type="text" onChange={e => form.setFieldValue(`billing_address.postal_code`, e.target.value)} value={form?.values?.billing_address?.postal_code} className="bg-transparent"></Form.Control>
                    {form.errors?.billing_address?.postal_code && form.touched.billing_address && (
                        <div className="text-danger mt-1">{form.errors.billing_address?.postal_code}</div>
                    )}
                </Col>
                {/*<Col sm={6}>
                    <Form.Label>VAT Number (optional)</Form.Label>
                    <Form.Control type="text" onChange={e => form.setFieldValue(`billing_address.vat`, e.target.value)} defaultValue={form?.values?.billing_address?.vat} className="bg-transparent"></Form.Control>
                    </Col>*/}
            </Row>
        }
        </>
    )
}

export default PaymentForm;