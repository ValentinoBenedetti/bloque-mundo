import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. En vez de arrancar en null, buscamos si hay alguien guardado en el navegador
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('usuarioBloqueMundo');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('usuarioBloqueMundo');
    });

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        // 🔥 GUARDAMOS AL USUARIO EN EL NAVEGADOR
        localStorage.setItem('usuarioBloqueMundo', JSON.stringify(userData));
        closeAuthModal();
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        // 🔥 BORRAMOS AL USUARIO AL SALIR
        localStorage.removeItem('usuarioBloqueMundo');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isAuthModalOpen,
            openAuthModal,
            closeAuthModal,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);