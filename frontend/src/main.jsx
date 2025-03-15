import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App';
import './index.css';

// Initialize the root once here
const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap the App component with BrowserRouter at the entry point
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);