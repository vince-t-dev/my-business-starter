// =========================================================
// * Volt React Dashboard
// =========================================================

// * Product Page: https://themesberg.com/product/dashboard/volt-react
// * Copyright 2021 Themesberg (https://www.themesberg.com)
// * Official Repository: https://github.com/themesberg/volt-react-dashboard
// * License: MIT License (https://themesberg.com/licensing)

// * Designed and coded by https://themesberg.com

// =========================================================

// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. Please contact us to request a removal.

import { createRoot } from "react-dom/client";
const container = document.getElementById("root");
const root = createRoot(container);
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { SiteContext } from "./context/site";

// core styles
import "./scss/volt.scss";

// vendor styles
import "react-datetime/css/react-datetime.css";
 
// home page
import HomePage from "./pages/HomePage";
import ScrollToTop from "./components/ScrollToTop";

root.render(<AuthProvider>
	<SiteContext>
		<BrowserRouter>
			<ScrollToTop />
			<HomePage />
		</BrowserRouter>
	</SiteContext>
</AuthProvider>);