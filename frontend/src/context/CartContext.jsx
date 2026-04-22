import { createContext, useState, useContext } from 'react';

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // NUEVO: Estado global para el menú lateral
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (product, quantity = 1) => {
        setCart((prevCart) => {
            const productId = product.id || product.idProducto || product.id_producto;
            const existingItem = prevCart.find(item => {
                const itemId = item.id || item.idProducto || item.id_producto;
                return String(itemId) === String(productId);
            });

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity <= 0) {
                    return prevCart.filter(item => String(item.id || item.idProducto) !== String(productId));
                }
                return prevCart.map(item => {
                    const itemId = item.id || item.idProducto || item.id_producto;
                    if (String(itemId) === String(productId)) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });
            }

            if (quantity > 0) {
                return [...prevCart, { ...product, quantity }];
            }
            return prevCart;
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => {
            const itemId = item.id || item.idProducto || item.id_producto;
            return String(itemId) !== String(productId);
        }));
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const totalPrice = cart.reduce((total, item) => {
        const price = item.precio || item.price || 0;
        return total + (price * item.quantity);
    }, 0);

    return (
        // Ahora compartimos isCartOpen y setIsCartOpen con toda la app
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice,
            isCartOpen, setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};