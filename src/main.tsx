import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LeagueProvider } from './contexts/LeagueContext';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LeagueProvider>
        <App />
      </LeagueProvider>
    </BrowserRouter>
  </React.StrictMode>
);
