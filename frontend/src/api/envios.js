const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/envios`;

export const getEnviosRequest = async () => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(API_URL, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Error al obtener los envíos');
    return response.json();
};

export const updateEnvioEstadoRequest = async (idEnvio, estado) => {
    const savedUser = localStorage.getItem('usuarioBloqueMundo');
    const token = savedUser ? JSON.parse(savedUser) : null;

    const response = await fetch(`${API_URL}/${idEnvio}/estado`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado })
    });
    if (!response.ok) throw new Error('Error al actualizar el estado');
    return response.json();
};
