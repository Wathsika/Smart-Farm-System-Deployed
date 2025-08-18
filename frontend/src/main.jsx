import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- CONTEXT PROVIDERS ---
import { CartProvider } from './context/CartContext.jsx'; 
// --- THIS IS THE FIX ---
// Import the AuthProvider from the AuthContext file we created.
import { AuthProvider } from './context/AuthContext.jsx'; 

// --- MAIN APP COMPONENT & STYLES ---
import App from "./App.jsx";
import './index.css'; 

// Create a new instance of the QueryClient.
const queryClient = new QueryClient();

// Render the application to the DOM.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 
        Provider components "provide" global state to all components nested inside them.
        The order is important. Generally, auth comes first.
      */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);