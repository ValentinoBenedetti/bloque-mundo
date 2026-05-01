import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCarritoRequest, agregarAlCarritoRequest, quitarDelCarritoRequest, vaciarCarritoRequest } from '../api/carrito';

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState([]);
    const [cartMetadata, setCartMetadata] = useState({ total: 0, descuentoAplicado: 0, totalConDescuento: 0, usuario: null });
    const [isCartOpen, setIsCartOpen] = useState(false);

    // 1. Efecto para cargar el carrito del backend al iniciar sesin
    useEffect(() => {
        const fetchCart = async () => {
            if (isAuthenticated) {
                try {
                    const data = await getCarritoRequest();
                    // Transformamos el formato del backend (lineas) al formato del frontend
                    const mappedCart = (data.lineas || []).map(l => ({
                        ...l.producto,
                        quantity: l.cantidad
                    }));
                    setCart(mappedCart);
                    setCartMetadata({
                        total: data.total,
                        descuentoAplicado: data.descuentoAplicado,
                        totalConDescuento: data.totalConDescuento,
                        usuario: data.usuario
                    });
                } catch (error) {
                    console.error("Error cargando el carrito:", error);
                }
            } else {
                setCart([]);
            }
        };
        fetchCart();
    }, [isAuthenticated]);

    const addToCart = async (product, quantity = 1) => {
        const productId = product.id || product.idProducto || product.id_producto;
        
        // Si est logueado, sincronizamos con el backend
        if (isAuthenticated) {
            try {
                const updatedData = await agregarAlCarritoRequest(productId, quantity);
                const mappedCart = (updatedData.lineas || []).map(l => ({
                    ...l.producto,
                    quantity: l.cantidad
                }));
                setCart(mappedCart);
                setCartMetadata({
                    total: updatedData.total,
                    descuentoAplicado: updatedData.descuentoAplicado,
                    totalConDescuento: updatedData.totalConDescuento,
                    usuario: updatedData.usuario
                });
            } catch (error) {
                console.error("Error al agregar al carrito en backend:", error);
            }
        } else {
            // Si no est logueado (aunque las rutas estǸn protegidas), manejo local opcional
            setCart((prevCart) => {
                const existingItem = prevCart.find(item => {
                    const itemId = item.id || item.idProducto || item.id_producto;
                    return String(itemId) === String(productId);
                });

                if (existingItem) {
                    const newQuantity = existingItem.quantity + quantity;
                    if (newQuantity <= 0) return prevCart.filter(item => String(item.id || item.idProducto) !== String(productId));
                    return prevCart.map(item => {
                        const itemId = item.id || item.idProducto || item.id_producto;
                        return String(itemId) === String(productId) ? { ...item, quantity: newQuantity } : item;
                    });
                }
                return quantity > 0 ? [...prevCart, { ...product, quantity }] : prevCart;
            });
        }
    };

    const removeFromCart = async (productId) => {
        if (isAuthenticated) {
            try {
                const updatedData = await quitarDelCarritoRequest(productId);
                const mappedCart = (updatedData.lineas || []).map(l => ({
                    ...l.producto,
                    quantity: l.cantidad
                }));
                setCart(mappedCart);
                setCartMetadata({
                    total: updatedData.total,
                    descuentoAplicado: updatedData.descuentoAplicado,
                    totalConDescuento: updatedData.totalConDescuento,
                    usuario: updatedData.usuario
                });
            } catch (error) {
                console.error("Error al quitar del carrito en backend:", error);
            }
        } else {
            setCart(prevCart => prevCart.filter(item => {
                const itemId = item.id || item.idProducto || item.id_producto;
                return String(itemId) !== String(productId);
            }));
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                await vaciarCarritoRequest();
                setCart([]);
                setCartMetadata({ total: 0, descuentoAplicado: 0, totalConDescuento: 0, usuario: null });
            } catch (error) {
                console.error("Error al vaciar carrito en backend:", error);
            }
        } else {
            setCart([]);
        }
    };

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const totalPrice = cart.reduce((total, item) => {
        const price = item.precio || item.price || 0;
        return total + (price * item.quantity);
    }, 0);

    return (
        // Ahora compartimos isCartOpen y setIsCartOpen con toda la app
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice,
            isCartOpen, setIsCartOpen, cartMetadata
        }}>
            {children}
        </CartContext.Provider>
    );
};