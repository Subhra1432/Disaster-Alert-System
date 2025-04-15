import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { getDatabaseService, getDatabaseType } from './services/databaseManager';

// Include Leaflet CSS - make sure this is loaded before any components using Leaflet
import 'leaflet/dist/leaflet.css';

// Initialize the database
getDatabaseService().then(dbService => {
  console.log(`Database initialized: ${getDatabaseType()}`);
  
  // Render the app after database initialization
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  
  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
}).catch(error => {
  console.error('Error initializing database:', error);
  
  // Render the app anyway to avoid blank screen
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  
  reportWebVitals();
}); 