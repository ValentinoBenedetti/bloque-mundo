const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fixUrl = (url) => {
    if (!url) return url;
    if (typeof url !== 'string') return url;
    if (url.includes('http://localhost:3000')) return url.replace('http://localhost:3000', API_URL);
    if (url.startsWith('uploads/')) return `${API_URL}/${url}`;
    return url;
};

export const fixProduct = (p) => {
    if (!p) return p;
    p.imagen = fixUrl(p.imagen);
    if (p.image) p.image = fixUrl(p.image); // Also fix .image if it exists
    if (p.imagenes && Array.isArray(p.imagenes)) {
        p.imagenes = p.imagenes.map(fixUrl);
    } else if (typeof p.imagenes === 'string' && p.imagenes.startsWith('[')) {
        try {
            const parsed = JSON.parse(p.imagenes);
            p.imagenes = Array.isArray(parsed) ? parsed.map(fixUrl) : parsed;
        } catch (e) {}
    }
    
    // Fix included products in a combo if they exist
    if (p.productos && Array.isArray(p.productos)) {
        p.productos = p.productos.map(item => {
            if (item.producto) item.producto = fixProduct(item.producto);
            return item;
        });
    }
    return p;
};

export const getProductsRequest = async () => {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error('Error al traer productos');
    let productos = await response.json();

    productos = productos.map(fixProduct);

    try {
        const combosResponse = await fetch(`${API_URL}/combos`);
        if (combosResponse.ok) {
            const combos = await combosResponse.json();
            const combosAsProducts = combos.map(c => {
                c = fixProduct(c);
                return {
                    ...c,
                    idProducto: `combo-${c.idCombo}`,
                    codigoProducto: c.codigoCombo || `CMB-${c.idCombo}`,
                    esCombo: true,
                    imagen: c.imagen || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop' // fallback
                };
            });
            return [...productos, ...combosAsProducts];
        }
    } catch (e) {
        console.error("Error fetching combos", e);
    }
    return productos;
};

export const getProductRequest = async (id) => {
    const fixUrl = (url) => {
        if (!url) return url;
        if (typeof url !== 'string') return url;
        if (url.includes('http://localhost:3000')) return url.replace('http://localhost:3000', API_URL);
        if (url.startsWith('uploads/')) return `${API_URL}/${url}`;
        return url;
    };
    
    const fixProduct = (p) => {
        p.imagen = fixUrl(p.imagen);
        if (p.imagenes && Array.isArray(p.imagenes)) {
            p.imagenes = p.imagenes.map(fixUrl);
        } else if (typeof p.imagenes === 'string' && p.imagenes.startsWith('[')) {
            try {
                const parsed = JSON.parse(p.imagenes);
                p.imagenes = Array.isArray(parsed) ? parsed.map(fixUrl) : parsed;
            } catch (e) {}
        }
        if (p.productos && Array.isArray(p.productos)) {
            p.productos = p.productos.map(item => {
                if (item.producto) item.producto = fixProduct(item.producto);
                return item;
            });
        }
        return p;
    };

    if (id && id.toString().startsWith('combo-')) {
        const realId = id.toString().replace('combo-', '');
        const response = await fetch(`${API_URL}/combos/${realId}`);
        if (!response.ok) throw new Error('Error al traer el combo');
        let c = await response.json();
        c = fixProduct(c);
        return {
            ...c,
            idProducto: `combo-${c.idCombo}`,
            codigoProducto: c.codigoCombo || `CMB-${c.idCombo}`,
            esCombo: true,
            imagen: c.imagen || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop'
        };
    }

    const response = await fetch(`${API_URL}/productos/${id}`);
    if (!response.ok) throw new Error('Error al traer el producto');
    let p = await response.json();
    p = fixProduct(p);
    return p;
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