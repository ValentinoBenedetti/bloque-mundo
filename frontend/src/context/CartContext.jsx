import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCarritoRequest, agregarAlCarritoRequest, quitarDelCarritoRequest, vaciarCarritoRequest } from '../api/carrito';
import Swal from 'sweetalert2';

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
    const [stockError, setStockError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const refreshCart = async () => {
        if (isAuthenticated) {
            try {
                const data = await getCarritoRequest();
                const mappedCart = (data.lineas || []).map(l => {
                    const item = l.combo ? {
                        ...l.combo,
                        idProducto: `combo-${l.combo.idCombo}`,
                        esCombo: true,
                        imagen: l.combo.imagen || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop'
                    } : l.producto;
                    return { ...item, quantity: l.cantidad, precioUnitario: l.precioUnitario }; // Added precioUnitario
                });
                setCart(mappedCart);
                setCartMetadata({
                    total: data.total,
                    descuentoAplicado: data.descuentoAplicado,
                    totalConDescuento: data.totalConDescuento,
                    usuario: data.usuario,
                    cambiosPrecio: data.cambiosPrecio || null
                });
            } catch (error) {
                console.error("Error cargando el carrito:", error);
            }
        } else {
            setCart([]);
        }
    };

    // 1. Efecto para cargar el carrito del backend al iniciar sesin
    useEffect(() => {
        refreshCart();
    }, [isAuthenticated]);

    const addToCart = async (product, quantity = 1, showToast = true) => {
        const productId = product.id || product.idProducto || product.id_producto;
        
        try {
            // Si est logueado, sincronizamos con el backend
            if (isAuthenticated) {
                const updatedData = await agregarAlCarritoRequest(productId, quantity);
                const mappedCart = (updatedData.lineas || []).map(l => {
                    const item = l.combo ? {
                        ...l.combo,
                        idProducto: `combo-${l.combo.idCombo}`,
                        esCombo: true,
                        imagen: l.combo.imagen || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop'
                    } : l.producto;
                    return { ...item, quantity: l.cantidad };
                });
                setCart(mappedCart);
                setCartMetadata({
                    total: updatedData.total,
                    descuentoAplicado: updatedData.descuentoAplicado,
                    totalConDescuento: updatedData.totalConDescuento,
                    usuario: updatedData.usuario
                });
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

            if (quantity > 0 && showToast) {
                // 🔥 Reproducir sonido de "Clic de Lego"
                try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.type = 'sine';
                    // Frecuencia inicial y final (drop rápido)
                    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
                    
                    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
                    
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.05);
                } catch (e) {
                    console.error("Audio error", e);
                }

                setSuccessMessage(`Agregaste al carrito: ${product.titulo || product.nombre}`);
                setTimeout(() => setSuccessMessage(null), 3000);

                // Modal eliminado a petición del usuario.
            }
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
            throw error;
        }
    };

    const removeFromCart = async (productId) => {
        if (isAuthenticated) {
            try {
                const updatedData = await quitarDelCarritoRequest(productId);
                const mappedCart = (updatedData.lineas || []).map(l => {
                    const item = l.combo ? {
                        ...l.combo,
                        idProducto: `combo-${l.combo.idCombo}`,
                        esCombo: true,
                        imagen: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop'
                    } : l.producto;
                    return { ...item, quantity: l.cantidad };
                });
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
            cart, addToCart, removeFromCart, clearCart, refreshCart, totalItems, totalPrice,
            isCartOpen, setIsCartOpen, cartMetadata, stockError, setStockError, successMessage, setSuccessMessage
        }}>
            {children}
        </CartContext.Provider>
    );
};