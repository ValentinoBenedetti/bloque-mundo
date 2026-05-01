const API_URL = 'http://localhost:3000';

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
