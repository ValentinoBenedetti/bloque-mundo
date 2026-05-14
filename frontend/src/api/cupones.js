const API_URL = 'http://localhost:3000';

export const getCuponesRequest = async () => {
    const response = await fetch(`${API_URL}/cupones`);
    if (!response.ok) throw new Error('Error al traer cupones');
    return response.json();
};

export const createCuponRequest = async (cuponData) => {
    const response = await fetch(`${API_URL}/cupones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuponData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear cupón');
    }
    return response.json();
};

export const deleteCuponRequest = async (codigo) => {
    const response = await fetch(`${API_URL}/cupones/${codigo}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar cupón');
    return response.json();
};
