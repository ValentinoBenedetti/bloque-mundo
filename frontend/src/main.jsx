import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

// Un solo render, envolviendo la App con el proveedor de Google
createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="447782173946-ptn9vcc0ehkok2l1pkrnlvdhdprvflr2.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
)