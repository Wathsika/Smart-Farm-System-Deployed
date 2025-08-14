// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// We are temporarily removing CartProvider to ensure the app renders.
// import { CartProvider } from './context/CartContext.jsx'; 
import App from "./App.jsx";
import './index.css'; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* <CartProvider> */}
        <App />
      {/* </CartProvider> */}
    </BrowserRouter>
  </React.StrictMode>
);