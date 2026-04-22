const API_URL = 'http://localhost:3000'; // Tu backend

export const getFavoritesRequest = async (usuarioId) => {
    const response = await fetch(`${API_URL}/favoritos/${usuarioId}`);
    if (!response.ok) throw new Error('Error al traer favoritos');
    return response.json();
};

export const toggleFavoriteRequest = async (usuarioId, productoId) => {
    const response = await fetch(`${API_URL}/favoritos/toggle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioId, productoId }),
    });

    if (!response.ok) throw new Error('Error al modificar favorito');
    return response.json();
};