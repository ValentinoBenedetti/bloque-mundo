const API_URL = 'http://localhost:3000'; // La dirección de tu NestJS

export const getProductsRequest = async () => {
    const response = await fetch(`${API_URL}/productos`);

    if (!response.ok) {
        throw new Error('Error al traer productos de la base de datos');
    }

    return response.json();
};