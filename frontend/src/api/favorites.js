const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Tu backend

import { fixProduct } from './products';

export const getFavoritesRequest = async (usuarioId) => {
    const response = await fetch(`${API_URL}/favoritos/${usuarioId}`);
    if (!response.ok) throw new Error('Error al traer favoritos');
    const favorites = await response.json();
    return favorites.map(fav => {
        if (fav.producto) fav.producto = fixProduct(fav.producto);
        return fav;
    });
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