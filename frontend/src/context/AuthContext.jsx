import { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // NUEVO: Estado para guardar los datos del usuario logueado
    const [user, setUser] = useState(null);

    // Función mágica para leer el ID del token
    const decodeToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    // Al cargar la app, vemos si ya había un token guardado
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userData = decodeToken(token);
            if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
            }
        }
    }, []);

    const login = (token) => {
        if (token) {
            localStorage.setItem('token', token);
            const userData = decodeToken(token);
            setUser(userData);
            setIsAuthenticated(true);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    const openAuthModal = (action = null) => {
        if (action) setPendingAction(() => action);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
        setPendingAction(null);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated, login, logout, user, // Exportamos "user"
            isAuthModalOpen, openAuthModal, closeAuthModal, pendingAction
        }}>
            {children}
        </AuthContext.Provider>
    );
};