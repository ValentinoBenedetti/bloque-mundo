const API_URL = 'http://localhost:3000';

export const getProductsRequest = async () => {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error('Error al traer productos');
    const productos = await response.json();

    try {
        const combosResponse = await fetch(`${API_URL}/combos`);
        if (combosResponse.ok) {
            const combos = await combosResponse.json();
            const combosAsProducts = combos.map(c => ({
                ...c,
                idProducto: `combo-${c.idCombo}`,
                codigoProducto: `CMB-${c.idCombo}`,
                esCombo: true,
                estado: 'Publicado',
                esDestacado: false,
                esNovedad: false,
                imagen: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop' // placeholder
            }));
            return [...productos, ...combosAsProducts];
        }
    } catch (e) {
        console.error("Error fetching combos", e);
    }
    return productos;
};

export const getProductRequest = async (id) => {
    if (id && id.toString().startsWith('combo-')) {
        const realId = id.toString().replace('combo-', '');
        const response = await fetch(`${API_URL}/combos/${realId}`);
        if (!response.ok) throw new Error('Error al traer el combo');
        const c = await response.json();
        return {
            ...c,
            idProducto: `combo-${c.idCombo}`,
            codigoProducto: `CMB-${c.idCombo}`,
            esCombo: true,
            estado: 'Publicado',
            esDestacado: false,
            esNovedad: false,
            imagen: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop'
        };
    }

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
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
            throw new Error(errorData.message);
        }
        throw new Error('Error al eliminar el producto');
    }
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