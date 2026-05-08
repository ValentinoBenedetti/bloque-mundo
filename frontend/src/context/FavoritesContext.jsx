import { createContext, useState, useContext, useEffect } from 'react';
import { getFavoritesRequest, toggleFavoriteRequest } from '../api/favorites';
import { useAuth } from './AuthContext';

// Función para traducir el token
const decodificarToken = (tokenData) => {
    try {
        if (!tokenData) return null;
        const tokenString = typeof tokenData === 'string' ? tokenData : tokenData.access_token;
        if (!tokenString) return tokenData;
        const base64Url = tokenString.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [favoritesIds, setFavoritesIds] = useState([]);

    // 🔥 1. AHORA SÍ: Decodificamos el token para sacar tu ID real al arrancar
    const userData = decodificarToken(user);
    const usuarioIdReal = userData?.sub;

    // 🔥 2. CREAMOS LA FUNCIÓN DE CARGA: Esto trae tus favs de la Base de Datos
    const cargarFavoritos = async () => {
        if (isAuthenticated && usuarioIdReal) {
            try {
                const data = await getFavoritesRequest(usuarioIdReal);
                // Extraemos los IDs de los productos para pintar los corazones
                setFavoritesIds(data.map(fav => fav.comboId ? `combo-${fav.comboId}` : (fav.productoId || fav.idProducto)));
            } catch (error) {
                console.error("Error cargando favoritos:", error);
            }
        } else {
            setFavoritesIds([]);
        }
    };

    // 3. Este useEffect llama a la función anterior cuando entrás a la página o te logueás
    useEffect(() => {
        cargarFavoritos();
    }, [isAuthenticated, usuarioIdReal]);

    const toggleFavorite = async (productoId) => {
        // Escudo protector: Si el productoId no es válido, frenamos todo.
        const isCombo = typeof productoId === 'string' && productoId.startsWith('combo-');
        if (!productoId || (!isCombo && isNaN(productoId))) {
            console.error("Error: El ID del producto no es válido:", productoId);
            return;
        }

        if (!usuarioIdReal) {
            console.error("No se encontró el ID del usuario");
            return;
        }

        try {
            // Mandamos la orden al backend (guardar/borrar)
            await toggleFavoriteRequest(usuarioIdReal, productoId);

            // 🔥 4. MAGIA: Volvemos a cargar los favoritos para que el estado de React se actualice
            // y el corazón se pinte (o despunte) al instante.
            await cargarFavoritos();

        } catch (error) {
            console.error("Error al modificar favorito", error);
        }
    };

    const isFavorite = (productId) => favoritesIds.some(id => String(id) === String(productId));

    return (
        <FavoritesContext.Provider value={{ favoritesIds, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};