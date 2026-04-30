const API_URL = 'http://localhost:3000';

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
    return response.json();
};
