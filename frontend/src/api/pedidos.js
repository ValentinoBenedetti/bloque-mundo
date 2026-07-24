const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const confirmarCompraRequest = async (data = {}) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;
    
    const response = await fetch(`${API_URL}/pedidos/checkout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Error al procesar la compra');
    }
    return response.json();
};

import { fixProduct } from './products';

export const getPedidosRequest = async () => {
    // Obtenemos el token de la misma forma que el resto de la app
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;
    
    const response = await fetch(`${API_URL}/pedidos/usuario`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Error al obtener el historial de compras');
    }
    const pedidos = await response.json();
    return pedidos.map(pedido => {
        if (pedido.lineasPedido && Array.isArray(pedido.lineasPedido)) {
            pedido.lineasPedido = pedido.lineasPedido.map(linea => {
                if (linea.producto) linea.producto = fixProduct(linea.producto);
                if (linea.combo) linea.combo = fixProduct(linea.combo);
                return linea;
            });
        }
        return pedido;
    });
};

export const getHistorialVentasAdminRequest = async () => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;
    
    const response = await fetch(`${API_URL}/pedidos/admin`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Error al obtener el historial de ventas');
    }
    const pedidos = await response.json();
    return pedidos.map(pedido => {
        if (pedido.lineasPedido && Array.isArray(pedido.lineasPedido)) {
            pedido.lineasPedido = pedido.lineasPedido.map(linea => {
                if (linea.producto) linea.producto = fixProduct(linea.producto);
                if (linea.combo) linea.combo = fixProduct(linea.combo);
                return linea;
            });
        }
        return pedido;
    });
};

export const crearPreferenciaRequest = async (data = {}) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;
    
    const response = await fetch(`${API_URL}/pedidos/crear-preferencia`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.message || 'Error al crear preferencia de Mercado Pago');
        err.data = errorData;
        throw err;
    }
    return response.json();
};

export const confirmarPagoAdminRequest = async (idPedido) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;
    
    const response = await fetch(`${API_URL}/pedidos/${idPedido}/confirmar`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Error al confirmar el pago manualmente');
    }
    return response.json();
};

export const cancelarPedidoRequest = async (idPedido) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;
    
    const response = await fetch(`${API_URL}/pedidos/${idPedido}/cancelar`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Error al cancelar el pedido');
    }
    return response.json();
};
