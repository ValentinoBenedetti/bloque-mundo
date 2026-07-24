const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getCombosRequest = async () => {
    const response = await fetch(`${API_URL}/combos`);
    if (!response.ok) throw new Error('Error al traer combos');
    return response.json();
};

export const createComboRequest = async (comboData) => {
    const response = await fetch(`${API_URL}/combos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(comboData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Error al crear el combo');
    }
    return response.json();
};

export const updateComboRequest = async (id, comboData) => {
    const response = await fetch(`${API_URL}/combos/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(comboData),
    });
    if (!response.ok) throw new Error('Error al actualizar el combo');
    return response.json();
};

export const deleteComboRequest = async (id) => {
    const response = await fetch(`${API_URL}/combos/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Error al eliminar el combo');
    }
    return response.json();
};
