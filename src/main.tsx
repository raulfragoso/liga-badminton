import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { UIProvider } from './contexts/UIContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { LeagueProvider } from './contexts/LeagueContext.tsx';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          <LeagueProvider>
            <App />
          </LeagueProvider>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
