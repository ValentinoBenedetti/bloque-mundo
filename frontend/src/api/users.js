const API_URL = (import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:3000'}');

export const getUserRequest = async (id) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`);
    if (!response.ok) {
        throw new Error('Error al obtener el usuario');
    }
    return response.json();
};

export const updateUserRequest = async (id, userData) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
    }
    return response.json();
};
