const API_URL = 'http://localhost:3000';

export const getProductsRequest = async () => {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error('Error al traer productos');
    return response.json();
};

export const getProductRequest = async (id) => {
    const response = await fetch(`${API_URL}/productos/${id}`);
    if (!response.ok) throw new Error('Error al traer el producto');
    return response.json();
};

export const createProductRequest = async (productData) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Error al crear el producto');
    return response.json();
};

export const updateProductRequest = async (id, productData) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Error al actualizar el producto');
    return response.json();
};

export const deleteProductRequest = async (id) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) throw new Error('Error al eliminar el producto');
    return response.json();
};

export const uploadProductImageRequest = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/productos/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) throw new Error('Error al subir la imagen');
    return response.json();
};