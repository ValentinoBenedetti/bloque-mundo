const API_URL = 'http://localhost:3000';

export const getTemasRequest = async () => {
    const response = await fetch(`${API_URL}/temas`);
    if (!response.ok) throw new Error('Error al traer temas');
    return response.json();
};
