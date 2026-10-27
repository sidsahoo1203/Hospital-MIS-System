import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import './index.css'
import StoreContextProvider from '../src/context/StoreContext.jsx'
import axios from "axios";

// All API calls use relative paths ("/api/v1/..."); the backend URL comes from .env
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </React.StrictMode>
);
