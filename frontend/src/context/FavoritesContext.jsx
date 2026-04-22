import { createContext, useState, useContext, useEffect } from 'react';
import { getFavoritesRequest, toggleFavoriteRequest } from '../api/favorites';
import { useAuth } from './AuthContext';

export const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth(); // Traemos al usuario real
    const [favoritesIds, setFavoritesIds] = useState([]);

    // Obtenemos el ID dinámico (NestJS suele mandarlo como 'sub' o 'id' en el token)
    const usuarioIdReal = user?.id || user?.sub;

    useEffect(() => {
        if (isAuthenticated && usuarioIdReal) {
            const fetchFavs = async () => {
                try {
                    const data = await getFavoritesRequest(usuarioIdReal);
                    setFavoritesIds(data.map(fav => fav.productoId));
                } catch (error) {
                    console.error("Error cargando favoritos:", error);
                }
            };
            fetchFavs();
        } else {
            setFavoritesIds([]);
        }
    }, [isAuthenticated, usuarioIdReal]);

    const toggleFavorite = async (product) => {
        const productId = product.id || product.idProducto || product.id_producto;
        if (!usuarioIdReal) return;

        try {
            await toggleFavoriteRequest(usuarioIdReal, productId);
            setFavoritesIds((prev) => {
                const isAlreadyFav = prev.some(id => String(id) === String(productId));
                return isAlreadyFav
                    ? prev.filter(id => String(id) !== String(productId))
                    : [...prev, productId];
            });
        } catch (error) {
            console.error("Error actualizando favorito:", error);
        }
    };

    const isFavorite = (productId) => favoritesIds.some(id => String(id) === String(productId));

    return (
        <FavoritesContext.Provider value={{ favoritesIds, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};