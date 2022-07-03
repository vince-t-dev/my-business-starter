import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useAuth } from "../context/auth";

function CustomSelect(props) {
	const [isOpen,setIsOpen] = useState(false);
	const [value, setValue] = useState(props.value);
	const [options, setOptions] = useState(props.options);
	const [isLoading, setIsLoading] = useState(false);
	//const [keyword,  setKeyword] = useState("");
	
	// on change method
	const toggleOpen = e => setIsOpen(!isOpen);
	const onSelectChange = value => {
		toggleOpen();
		setValue(value);
		if (props.onSelectChange) props.onSelectChange(value);
	};

	// update options when props changed
	useEffect(() => {
		// format output for options
		let updated_options = props.options?.map((option, index) => {
			let updated_option = option;
			if (!updated_option.label) {
				updated_option = {
					...option,
					label: option.Title || option.Name || option.Label || option.Value,
					value: option.Id,
					key: index
				}
			}
			return updated_option;
		});
		setOptions(updated_options);
		setValue("");
	},[props.options]);

	// on init
	useEffect(() => {
		// format output for value
		// this may need to be formatted further to align with xpr objects
		let formatted_props_value = "";
		if (props.value && (!props.value.label || !props.value.value)) {
			formatted_props_value = {
				label: props.value?.Title || props.value?.Name || props.value?.Label || props.value?.Value, 
				value: props.value?.Id, 
				key: props.value?.Id
			} 
		}
		setValue(formatted_props_value);
	},[]);

	// custom styles
	const selectStyles = {
		// container
		control: (provided) => ({
			...provided,
			height: (props.size == "sm") ? "auto" : "2.637rem",    
			minHeight: (props.size == "sm") ? "1.875rem" : "2.375rem",
			boxShadow: "none",
			borderRadius: "0.313rem",
			"&:focus-within": {
				border: "1px solid #4E82EA"
			}
		}),
		// selected value
		singleValue: (provided) => ({
			...provided,
			fontSize: (props.size == "sm") ? "0.75rem" : "0.938rem",
			color: "#515253"
		}),
		// dropdown wrapper below search bar
		menu: () => ({}),
		menuList: (provided) => ({ 
			...provided, 
			position: "absolute",
			width: "100%",
			zIndex: 100,
			background: "white",
			maxHeight: "12.5rem", 
			boxShadow: "0 0.25rem 1.5rem rgba(0, 0, 0, 0.25)",
			borderRadius: "0.313rem",
			padding: (props.size == "sm") ? "0.469rem 0.7rem" : "1.25rem 2rem",
			/* scrollbar width */
			"&::-webkit-scrollbar": { width: "0.188rem" },
			/* scrollbar track */
			"&::-webkit-scrollbar-track": { background: "transparent" },
			/* scrollbar handle */
			"&::-webkit-scrollbar-thumb": { backgroundColor: "#c4c4c4", boderRadius: "0.625rem" }
		}),
		// each select option
		option: (provided, state) => ({ 
			cursor: "pointer",
			padding: "0.25rem 0", 
			fontSize: (props.size == "sm") ? "0.75rem" : "0.938rem",
			fontWeight: state.isSelected ? "600" : "400",
			color: state.isSelected ? "#4E82EA !important" : "inherit",
			"&:hover": {
				color: "#000"
			}
		})
	};

	{/* commented: old markup that shows search bar inside dropdown */}
	/*const Menu = props => {
		<div className="custom-select" {...props}/>
	};
	const Blanket = props => (
		<div style={{ position: "fixed", bottom: 0, left: 0, top: 0, right: 0, zIndex: 1 }}
			{...props}
		/>
	);
	const Dropdown = ({ children, isOpen, target, onClose }) => (
		<div className="position-relative">
			{target} 
			{isOpen && !props.disabled ? <Menu>{children}</Menu> : null}
			{isOpen ? <Blanket onClick={onClose} /> : null}
		</div>
	);*/

	// custom search/caret icons
	const DropdownIndicator = () => (
		<>
			{props.searchable 
			? <i className="xpri-search-alt text-dark font-lg p-0 pe-2"></i>
			: <i className="xpri-caret text-gray-700 font-xs" style={{transform: "rotate(90deg)", marginRight: "0.75rem"}}></i>}
		</>
	);

	// custom clear indicator icon
	const ClearIndicator = (props) => {
		const {
		  	children = <i className="xpri-plus clear-indicator"></i>,
		  	getStyles,
		  	innerProps: { ref, ...restInnerProps }
		} = props;
		return (
		  	<div 
				{...restInnerProps}
				ref={ref}
				style={{ padding: "0" }}>
				<div>{children}</div>
		  	</div>
		);
	};

	// async load data
	let auth = useAuth();
	let url = new URL(window.location.href);
	const loadOptions = inputValue => {	
		setIsLoading(true);
		if (props.search_url_params) {
			let props_params = props.search_url_params;
			for (const prop in props_params) url.searchParams.append(prop, props_params[prop]);
		}
		if (inputValue) url.searchParams.append("q", inputValue);
		fetch(`${props.search_url}${url.search}`, {
			method: "GET",
			headers: { Auth: auth.user.token }
		})
		.then(res => res.json())
		.then(
			(result) => {
				setIsLoading(false);
				// format returned results to options {label: .., value: .., key: ..}
				// supported endpoints
				let result_options = result?._embedded?.Event || 
				result?._embedded?.Product || 
				result?._embedded?.Article ||
				result?._embedded?.Section ||
				result;
				let formatted_options = result_options.map((option, index) => {
					return {
						...option,
						label: option.Title || option.Name || option.Label,
						value: option.Id,
						key: index
					};
				})
				setOptions(formatted_options);
			}
		)	
	};
	// input change event
	let input_timer = 0;
	const handleInputChange = (inputValue, { action }) => {
		if (action === "input-change") {
			if (inputValue.length > 2) {
				clearTimeout(input_timer);
				input_timer = setTimeout(() => { 
					//setKeyword(inputValue);
					loadOptions(inputValue); 
				}, 1000);
			}
		}
	}

	return (
		<>
			{/* commented: old markup that shows search bar inside dropdown */}
			{/*<Dropdown
				isOpen={isOpen}
				onClose={toggleOpen}
				target={ 
					<div className="form-select" role="button" onClick={toggleOpen}>
						{value ? `${value.label || value.Label || value.Title || value.Name || value.value || value.Value || value}` : `${props.value?.label || props.placeholder || "Select..."}` }
					</div>
				}>*/}
			 	<Select
				 	key={`select_key__${props.value}`}
					components={{ DropdownIndicator, IndicatorSeparator: null, ClearIndicator }}
					//autoFocus
					//menuIsOpen
					//controlShouldRenderValue={false}
					//hideSelectedOptions={false}
					//backspaceRemovesValue={false}
					//tabSelectsValue={false}
					isClearable={props.isClearable == false ? props.isClearable : props.value ? true : false}
					onChange={onSelectChange}
					onInputChange={handleInputChange}
					options={options}
					placeholder={props.searchable ? "Search..." : "Select..."}
					styles={selectStyles}
					value={value?.label ? value : props.value?.label ? props.value : ""}
					isSearchable={props.searchable ? true : false}
					isDisabled={props.disabled ? true : false}
					noOptionsMessage={() => props.noOptionsMessage}
					isLoading={isLoading}
				/>
			{/*</Dropdown>*/}
		</>
	);
}

export default CustomSelect;