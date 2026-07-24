const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Asegúrense de que su NestJS esté en el 3000

export const loginRequest = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Credenciales incorrectas');
    }

    return response.json(); // Esto nos devuelve el { access_token }
};
// Función para verificar si el email ya existe
export const verifyUserRequest = async (email) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/verify/${email}`);
    return await res.json();
};

// Función para registrar al usuario nuevo con Google + datos extra
export const registerRequest = async (userData) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return await res.json();
};