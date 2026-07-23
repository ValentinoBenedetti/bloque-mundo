const API_URL = (import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:3000'}');

export const getUserStatusRequest = async (idUsuario) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/usuarios/status/${idUsuario}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Error al obtener el estado del usuario');
    return response.json();
};

export const getAllUsuariosRequest = async () => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Error al obtener los usuarios');
    return response.json();
};

export const getUsuarioPedidosRequest = async (idUsuario) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/pedidos/admin`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Error al obtener los pedidos del usuario');
    return response.json();
};
