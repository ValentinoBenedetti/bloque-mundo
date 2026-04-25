import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Buscamos al usuario de forma SEGURA
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('usuarioBloqueMundo');
            // Si existe y no es la palabra "undefined", lo leemos. Si no, devolvemos null.
            if (savedUser && savedUser !== "undefined") {
                return JSON.parse(savedUser);
            }
            return null;
        } catch (error) {
            console.error("Error leyendo el localStorage. Reiniciando usuario.", error);
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const savedUser = localStorage.getItem('usuarioBloqueMundo');
        return !!savedUser && savedUser !== "undefined";
    });

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('usuarioBloqueMundo', JSON.stringify(userData));
        closeAuthModal();
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
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