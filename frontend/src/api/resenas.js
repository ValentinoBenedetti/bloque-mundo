const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const createResenaRequest = async (resenaData) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/resenas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resenaData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la reseña');
    }

    return response.json();
};

export const checkUserReviewRequest = async (idProducto, idPedido) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/resenas/verificar/${idProducto}/${idPedido}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) return { hasReviewed: false };
    return response.json();
};

export const getResenasRequest = async (idProducto) => {
    const response = await fetch(`${API_URL}/resenas/producto/${idProducto}`);
    if (!response.ok) return [];
    return response.json();
};

export const getReviewForAdminRequest = async (idUsuario, idProducto, idPedido) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/resenas/admin/${idUsuario}/${idProducto}/${idPedido}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) return null;
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
};

export const deleteReviewAdminRequest = async (idResena) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/resenas/admin/${idResena}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error al eliminar la reseña');
    }
    return response.json();
};
