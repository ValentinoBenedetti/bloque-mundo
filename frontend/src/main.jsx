import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

// Interceptor global de fetch para redireccionar en caso de 401 Unauthorized (Sesión expirada)
const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
    const url = args[0];
    const response = await originalFetch(...args);
    
    // Si la petición falla con 401 y NO es una petición de autenticación propiamente dicha
    const isAuthRequest = typeof url === 'string' && (url.includes('/auth/login') || url.includes('/auth/verify'));
    
    if (response.status === 401 && !isAuthRequest) {
        const savedUser = localStorage.getItem('usuarioBloqueMundo');
        if (savedUser) {
            localStorage.removeItem('usuarioBloqueMundo');
            // Redirigir al inicio notificando la expiración de la sesión
            window.location.href = '/?session_expired=true';
        }
    }
    return response;
};

// Un solo render, envolviendo la App con el proveedor de Google
createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="447782173946-ptn9vcc0ehkok2l1pkrnlvdhdprvflr2.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
)