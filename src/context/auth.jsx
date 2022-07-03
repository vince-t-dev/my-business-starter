import React, { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const authContext = createContext();
export function AuthProvider({ children }) {
	const auth = useAuthProvider();
	return <authContext.Provider value={auth}> { children } </authContext.Provider>
}

export const useAuth = () => useContext(authContext);

function useAuthProvider() {
	const [user, setUser] = useState(null);

	// sign in
	const signin = async (credentials, callback) => {
		let jsonData = credentials;
		jsonData.action = "login";
		
		const response = await axios.post("/__xpr__/pub_engine/my-business-starter/element/ajax_handler",JSON.stringify(jsonData), {
			headers: { "Content-Type": "application/json" },
			withCredentials: true
		});

		let result = (response.data?.data) ? JSON.parse(response.data?.data) : response.data; 

		// get xsrf token from cookie
		let sessionCookie = document.cookie.replace(/(?:(?:^|.*;\s*)xpr-token-backend\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		let sessionData = sessionCookie ? JSON.parse(atob(sessionCookie.split('.')[1])) : "";
		let xsrf_token = sessionData.xsrf;

		let userData = {"token": result.token, "xsrf_token": xsrf_token, "data": response.data?.user};
		if (!result.error) {
			setUser(userData);
			localStorage.removeItem("invalid_token");
			localStorage.setItem("user",JSON.stringify(userData));
		}
		if (callback) callback(result);
	}

	// sign out
	const signout = async (callback) => {
		let user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
		let jsonData = { action: "logout" };
		const response = await axios.post("/__xpr__/pub_engine/my-business-starter/element/ajax_handler",JSON.stringify(jsonData), {
			headers: {
				"Auth": user.token,
				"Content-Type": "application/json" 
			},
			withCredentials: true
		});

		// clear user data
		setUser(null);
		localStorage.clear();
		if (callback) callback(response);
	}

	// check authentication
	useEffect(() => {
		// validate access token on page load
		let user_data = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
		if (user_data && !localStorage.getItem("invalid_token")) {
			let token = user_data.token;
			let jsonData = { action: "checkAuth" };
			axios.post("/__xpr__/pub_engine/my-business-starter/element/ajax_handler",JSON.stringify(jsonData), {
				headers: {
					"Auth": token,
					"Content-Type": "application/json" 
				},
				withCredentials: true
			})
			.then(function(response) {
				// invalid/expired token
				if (response.data?.error) {
					// clear user data and redirect user to lock screen
					localStorage.clear();
					let token_data = { error: response.data?.error, user_info: user_data.data, from: window.location.pathname };			
					localStorage.setItem("invalid_token", JSON.stringify(token_data));
					window.location.replace("/my-business/lock");
				}
			});
		}
	}, [])

	return {
		user,
		signin,
		signout
	}
}