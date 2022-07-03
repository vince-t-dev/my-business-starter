import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import moment from "moment";
import Datetime from "react-datetime";
import { useSite } from "../context/site";

function DateTimePicker(props) {
    // default states/options
    const viewMode = props.viewMode || "days";
    const isTimePicker = (viewMode == "time");
    const dateFormat = !isTimePicker ? "YYYY-MM-DD" : false;
    let formatted_value = props.value;
    const [value, setValue] = useState(formatted_value);
    let placeholder = (isTimePicker) ? "HH:mm" : "Select date";
    const [size,setSize] = useState(props.size);

    // range picker feature
    const enableRange = props.enableRange;
    const [rangeCount, setRangeCount] = useState(0);
    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");

    let site = useSite();

    // on value change: format value and return data
    site.useUpdateEffect(() => {
        formatted_value = (!isTimePicker) ? moment(value).format("YYYY-MM-DD HH:mm") : moment(value).format("HH:mm");
        let formatted_from = rangeFrom ? moment(rangeFrom).format("YYYY-MM-DD") : "";
        let formatted_to = rangeTo ? moment(rangeTo).format("YYYY-MM-DD") : "";
        if (props.onChange) props.onChange(props.name, formatted_value, props.id, formatted_from, formatted_to);
    },[value]);

    const handleDateChange = (value) => {
        setValue(value);
        // handle range picker feature
        if (enableRange) {
            // tracking clicks to identify from/to range
            setRangeCount(prevCount => prevCount+1); 
            if (rangeCount > 1) {  
                setRangeCount(0);
                setRangeFrom("");
                setRangeTo("");
            }
            if (rangeCount == 0) setRangeFrom(value);
            if (rangeCount == 1) setRangeTo(value);
        }
    }

    return (
        <>
            <Datetime
                dateFormat={dateFormat}
                timeFormat={isTimePicker}
                timeConstraints={{ minutes: { step: 15 }}}
                initialValue={props.value ? new Date(props.value) : new Date(value)}
                onChange={handleDateChange}
                initialViewMode={viewMode}
                className={enableRange ? "date-range " + viewMode + "-picker " : viewMode+"-picker "}
                closeOnSelect={!enableRange}
                renderInput={(props, openCalendar) => (
                    <InputGroup>
                        <Form.Control
                            size={size}
                            type="text"
                            value={props.value 
                                ? (enableRange && rangeFrom && rangeTo) 
                                    ? moment(rangeFrom).format("MMM D, YYYY") + " - " + moment(rangeTo).format("MMM D, YYYY") 
                                    : props.value 
                                : value}
                            placeholder={placeholder}
                            onFocus={openCalendar} 
                            onChange={() => {}} />
                        <InputGroup.Text><i className={!isTimePicker ? "xpri-calendar" : "xpri-clock"}></i></InputGroup.Text> 
                    </InputGroup>
                )} 
                renderDay={(props, currentDate, selectedDate) => {         
                    // add class for selected date range
                    if (enableRange && rangeFrom && rangeTo) 
                        var is_in_range = moment(currentDate).isBetween(moment(rangeFrom).subtract(1,"days"), moment(rangeTo));
                    return <td data-range={is_in_range} {...props}>{currentDate.date()}</td>;
                }}
                /* extend calendar view
                renderView={(mode, renderDefault) => {
                    if (!props.showControls) return renderDefault();
                    if (props.showControls) return (
                        <div className="wrapper text-center">
                            {renderDefault()}
                            <Button variant="link" type="button" className="w-100" onClick={e => setValue("")}>Clear</Button>
                        </div>
                    )
                }}*//>
        </>
    );
}

export default DateTimePicker;