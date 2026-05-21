const API_URL = 'http://localhost:3000';

export const getCategoriasRequest = async () => {
    const response = await fetch(`${API_URL}/categorias`);
    if (!response.ok) throw new Error('Error al traer categorias');
    return response.json();
};

export const createCategoriaRequest = async (categoria) => {
    const response = await fetch(`${API_URL}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
    });
    if (!response.ok) throw new Error('Error al crear categoria');
    return response.json();
};

export const deleteCategoriaRequest = async (id) => {
    const response = await fetch(`${API_URL}/categorias/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al eliminar categoria');
    }
    return response.json();
};
