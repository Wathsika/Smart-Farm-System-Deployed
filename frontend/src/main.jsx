import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from './context/CartContext.jsx'; 
import './index.css'; 

// --- THIS IS THE FIX ---

// 1. Import the necessary components from TanStack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. Create a new instance of the QueryClient.
//    This object holds the cache and configuration for all your queries.
const queryClient = new QueryClient();


// --- RENDER YOUR APPLICATION ---

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 3. Wrap your entire application with the QueryClientProvider. */}
      {/*    This makes the query client available to any component in your app. */}
      <QueryClientProvider client={queryClient}>
        
        {/* Your other providers, like CartProvider, go inside it. */}
        <CartProvider>
          <App />
        </CartProvider>
        
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);