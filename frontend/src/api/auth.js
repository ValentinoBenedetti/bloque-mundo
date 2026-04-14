const API_URL = 'http://localhost:3000'; // Asegúrense de que su NestJS esté en el 3000

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