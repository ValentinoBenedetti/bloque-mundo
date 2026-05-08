const API_URL = 'http://localhost:3000';

const getHeaders = () => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getCarritoRequest = async () => {
    const response = await fetch(`${API_URL}/carrito`, {
        headers: getHeaders()
    });
    if (!response.ok) return { total: 0, lineas: [] };
    return response.json();
};

export const agregarAlCarritoRequest = async (idProducto, cantidad) => {
    const response = await fetch(`${API_URL}/carrito/agregar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ idProducto, cantidad })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
            throw new Error(errorData.message);
        }
        throw new Error('Error al agregar al carrito');
    }
    return response.json();
};

export const quitarDelCarritoRequest = async (idProducto) => {
    const response = await fetch(`${API_URL}/carrito/quitar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ idProducto })
    });
    return response.json();
};

export const vaciarCarritoRequest = async () => {
    const response = await fetch(`${API_URL}/carrito/vaciar`, {
        method: 'POST',
        headers: getHeaders()
    });
    return response.json();
};
