import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { PomodoroProvider } from './contexts/PomodoroContext.jsx';
import './index.css';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PomodoroProvider>
          <App />
        </PomodoroProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);