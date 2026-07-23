const API_URL = (import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:3000'}');

export const getTemasRequest = async () => {
    const response = await fetch(`${API_URL}/temas`);
    if (!response.ok) throw new Error('Error al traer temas');
    return response.json();
};

export const createTemaRequest = async (tema) => {
    const response = await fetch(`${API_URL}/temas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tema)
    });
    if (!response.ok) throw new Error('Error al crear tema');
    return response.json();
};

export const deleteTemaRequest = async (id) => {
    const response = await fetch(`${API_URL}/temas/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al eliminar tema');
    }
    return response.json();
};
