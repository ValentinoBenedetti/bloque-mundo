const API_URL = 'http://localhost:3000';

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

export const checkUserReviewRequest = async (idProducto) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/resenas/verificar/${idProducto}`, {
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
