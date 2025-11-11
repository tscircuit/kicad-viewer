import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ContextProviders from "./ContextProviders";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ContextProviders>
			<App />
		</ContextProviders>
	</React.StrictMode>,
);
