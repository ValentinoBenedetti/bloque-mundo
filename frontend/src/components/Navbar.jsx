import { useState, useEffect, useRef } from 'react';
import { Search, User, Heart, ShoppingCart, X, Plus, Minus, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { getProductsRequest } from '../api/products';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import ProfileSidebar from './ProfileSidebar';
import ConfirmModal from './ConfirmModal';
import StockErrorModal from './StockErrorModal';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // DETECTAMOS SI ESTAMOS EN LA PÁGINA DE LOGIN
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // ESTADO PARA MODAL DE CONFIRMACIN
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        product: null,
        action: null // 'remove' o 'minus'
    });

    const searchRef = useRef(null);

    const { cart, addToCart, removeFromCart, totalItems, totalPrice, isCartOpen, setIsCartOpen, stockError, setStockError, successMessage } = useCart();
    const { favoritesIds } = useFavorites();
    const { isAuthenticated, openAuthModal } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProductsRequest();
                setProducts(data);
            } catch (err) {
                console.error("Error cargando productos", err);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSuggestions([]);
            setIsDropdownOpen(false);
            return;
        }
        const fuse = new Fuse(products, { keys: ['titulo', 'categoria'], threshold: 0.3, distance: 100 });
        const results = fuse.search(searchTerm);
        const filteredResults = results.map(result => result.item).filter(item => item.estado === 'Publicado');
        setSuggestions(filteredResults.slice(0, 5));
        setIsDropdownOpen(true);
    }, [searchTerm, products]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== '') {
            setIsDropdownOpen(false);
            navigate(`/tienda?q=${searchTerm}`);
        }
    };

    const handleSuggestionClick = (titulo) => {
        setSearchTerm(titulo);
        setIsDropdownOpen(false);
        navigate(`/tienda?q=${titulo}`);
    };

    const handleProfileClick = () => {
        if (isAuthenticated) {
            setIsProfileSidebarOpen(true);
        } else {
            openAuthModal();
        }
    };

    const formatPrice = (p) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p || 0);

    const handleFavoritesNav = () => {
        if (!isAuthenticated) {
            openAuthModal(() => navigate('/favoritos'));
            return;
        }
        navigate('/favoritos');
    };

    // ==============================================================
    // 🔥 EL "OTRO HEADER" (SOLO PARA LOGIN/REGISTRO)
    // ==============================================================
    if (isAuthPage) {
        return (
            <nav className="bg-brand-red py-4 px-10 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <h1 className="text-4xl font-logo text-white tracking-widest select-none cursor-default uppercase">
                    Bloque Mundo
                </h1>

                {/* BOTÓN "CONTINUAR A LA TIENDA" */}
                <button
                    onClick={() => navigate('/tienda')}
                    className="text-white font-extrabold text-[15px] tracking-widest uppercase hover:text-brand-yellow hover:scale-105 transition duration-200 cursor-pointer underline underline-offset-4"
                >
                    Continuar a la tienda
                </button>
            </nav>
        );
    }

    // ==============================================================
    // VISTA NORMAL: TIENDA COMPLETA (Para el resto de la página)
    // ==============================================================
    return (
        <>
            <nav className="bg-brand-red py-4 px-4 md:px-10 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white hover:text-brand-yellow md:hidden focus:outline-none transition duration-200 cursor-pointer"
                        aria-label="Abrir menú"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 
                        className="text-2xl sm:text-3xl md:text-4xl font-logo text-white tracking-widest cursor-pointer uppercase hover:text-brand-yellow transition duration-200 whitespace-nowrap" 
                        onClick={() => navigate('/')}
                    >
                        Bloque Mundo
                    </h1>
                </div>

                <div className="hidden md:flex gap-10 text-white font-bold text-[16px] tracking-wide items-center">
                    <button 
                        onClick={() => navigate('/')} 
                        className={`transition duration-200 cursor-pointer ${location.pathname === '/' ? 'text-brand-yellow font-black scale-105' : 'hover:text-brand-yellow hover:scale-105'}`}
                    >
                        Inicio
                    </button>
                    <button 
                        onClick={() => navigate('/tienda')} 
                        className={`transition duration-200 cursor-pointer ${location.pathname.startsWith('/tienda') ? 'text-brand-yellow font-black scale-105' : 'hover:text-brand-yellow hover:scale-105'}`}
                    >
                        Tienda
                    </button>
                    <button 
                        onClick={() => navigate('/nosotros')} 
                        className={`transition duration-200 cursor-pointer ${location.pathname.startsWith('/nosotros') ? 'text-brand-yellow font-black scale-105' : 'hover:text-brand-yellow hover:scale-105'}`}
                    >
                        Nosotros
                    </button>

                    <div className="relative ml-4" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => searchTerm.trim() !== '' && setIsDropdownOpen(true)}
                            className="bg-white py-2 pl-5 pr-10 rounded-full text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow w-72 transition-all shadow-lg border-none placeholder:text-slate-400 font-medium"
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-brand-red" onClick={() => searchTerm.trim() !== '' && navigate(`/tienda?q=${searchTerm}`)} />

                        {isDropdownOpen && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
                                {suggestions.map((item) => (
                                    <div key={item.id} onClick={() => handleSuggestionClick(item.titulo)} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50">
                                        <img src={item.imagen || item.imagenes || item.image} alt={item.titulo} className="w-10 h-10 object-contain mix-blend-multiply" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800 truncate w-48">{item.titulo || item.nombre}</span>
                                            <span className="text-xs font-black text-brand-red">{formatPrice(item.precio || item.price)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 sm:gap-7 text-white items-center">
                    <User size={22} className="cursor-pointer hover:text-brand-yellow hover:scale-110 transition duration-200" onClick={handleProfileClick} />

                    <div className="relative cursor-pointer hover:text-brand-yellow hover:scale-110 transition duration-200" onClick={handleFavoritesNav}>
                        <Heart size={22} />
                        {favoritesIds.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-white text-brand-red text-[9px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center shadow-sm">
                                {favoritesIds.length}
                            </span>
                        )}
                    </div>

                    <div className="relative cursor-pointer hover:text-brand-yellow hover:scale-110 transition duration-200" onClick={() => setIsCartOpen(true)}>
                        <ShoppingCart size={22} />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-3 bg-brand-yellow text-slate-900 text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {/* CARRITO Y SIDEBAR */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsCartOpen(false)}
                    />
                    <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Carrito</h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="text-center text-slate-500 mt-20">
                                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0">
                                        <div className="w-20 h-20 bg-slate-100 rounded-lg p-2 shrink-0">
                                            <img src={item.imagen || item.imagenes || item.image} className="w-full h-full object-contain mix-blend-multiply" alt="producto" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-base font-extrabold text-slate-800 leading-tight mb-1.5">{item.titulo || item.nombre}</h3>
                                            <div className="text-sm font-medium text-slate-500 mb-3">
                                                {item.quantity} x <span className="font-extrabold text-slate-950">{formatPrice(item.precio || item.price)}</span>
                                            </div>
                                            <div className="flex items-center border border-slate-200 rounded w-max bg-white">
                                                <button 
                                                    onClick={() => {
                                                        if (item.quantity === 1) {
                                                            setConfirmModal({
                                                                isOpen: true,
                                                                product: item,
                                                                action: 'minus'
                                                            });
                                                        } else {
                                                            addToCart(item, -1);
                                                        }
                                                    }} 
                                                    className="px-2.5 py-1.5 text-slate-400 hover:text-slate-900 transition"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="px-3 text-sm font-black text-slate-800">{item.quantity}</span>
                                                <button 
                                                    onClick={async () => {
                                                        try {
                                                            await addToCart(item, 1);
                                                        } catch (err) {
                                                            setStockError(err.message || "No hay suficiente stock");
                                                        }
                                                    }} 
                                                    className="px-2.5 py-1.5 text-slate-400 hover:text-slate-900 transition"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setConfirmModal({
                                                    isOpen: true,
                                                    product: item,
                                                    action: 'remove'
                                                });
                                            }} 
                                            className="bg-slate-100 text-slate-400 hover:bg-brand-red hover:text-white p-1.5 rounded-full transition self-start"
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-slate-100 bg-white">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="font-bold text-slate-500 text-base">Subtotal</span>
                                    <span className="text-2xl font-black text-slate-900">{formatPrice(totalPrice)}</span>
                                </div>
                                <button
                                    onClick={() => { setIsCartOpen(false); navigate('/carrito'); }}
                                    className="w-full bg-brand-red text-white font-black py-4 rounded-lg shadow-lg hover:bg-red-700 transition-all uppercase tracking-widest text-base italic mb-3"
                                >
                                    Ver carrito
                                </button>
                                <button
                                    onClick={() => { setIsCartOpen(false); navigate('/tienda'); }}
                                    className="w-full bg-white text-brand-red border-2 border-brand-red font-black py-3 rounded-lg shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-base italic"
                                >
                                    Seguir comprando
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MENU MOVIL HAMBURGUESA */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] flex">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        {/* Drawer */}
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-4/5 max-w-xs bg-slate-950 h-full shadow-2xl flex flex-col p-6 border-r border-slate-800 z-10"
                        >
                            {/* Header of Drawer */}
                            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                                <h2 className="text-xl font-black text-white uppercase italic tracking-wide">
                                    Menú
                                </h2>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Search Bar inside Drawer */}
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchTerm.trim() !== '') {
                                            setIsMobileMenuOpen(false);
                                            handleKeyDown(e);
                                        }
                                    }}
                                    className="bg-slate-900 py-2.5 pl-5 pr-10 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow w-full transition-all border border-slate-800 placeholder:text-slate-500 font-medium"
                                />
                                <Search 
                                    size={18} 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-brand-yellow" 
                                    onClick={() => {
                                        if (searchTerm.trim() !== '') {
                                            setIsMobileMenuOpen(false);
                                            navigate(`/tienda?q=${searchTerm}`);
                                        }
                                    }} 
                                />
                            </div>

                            {/* Navigation Links */}
                            <div className="flex flex-col gap-4 font-bold text-[16px] tracking-wide text-white">
                                <button 
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }} 
                                    className={`text-left transition duration-200 flex items-center gap-3 py-3 px-4 rounded-xl ${location.pathname === '/' ? 'bg-brand-red text-white font-black' : 'hover:bg-slate-900 text-slate-300 hover:text-white'}`}
                                >
                                    Inicio
                                </button>
                                <button 
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/tienda'); }} 
                                    className={`text-left transition duration-200 flex items-center gap-3 py-3 px-4 rounded-xl ${location.pathname.startsWith('/tienda') ? 'bg-brand-red text-white font-black' : 'hover:bg-slate-900 text-slate-300 hover:text-white'}`}
                                >
                                    Tienda
                                </button>
                                <button 
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/nosotros'); }} 
                                    className={`text-left transition duration-200 flex items-center gap-3 py-3 px-4 rounded-xl ${location.pathname.startsWith('/nosotros') ? 'bg-brand-red text-white font-black' : 'hover:bg-slate-900 text-slate-300 hover:text-white'}`}
                                >
                                    Nosotros
                                </button>
                            </div>

                            {/* Footer or extra info in mobile menu */}
                            <div className="mt-auto pt-6 text-center text-xs text-slate-600 font-medium border-t border-slate-900">
                                © Bloque Mundo • Premium Store
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ProfileSidebar
                isOpen={isProfileSidebarOpen}
                onClose={() => setIsProfileSidebarOpen(false)}
            />

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={() => {
                    if (confirmModal.action === 'remove') {
                        removeFromCart(confirmModal.product.id || confirmModal.product.idProducto || confirmModal.product.id_producto);
                    } else {
                        addToCart(confirmModal.product, -1);
                    }
                }}
                title="¿Eliminar producto?"
                message={`¿Estás seguro que deseas eliminar "${confirmModal.product?.titulo || confirmModal.product?.nombre}" del carrito?`}
            />

            <StockErrorModal 
                isOpen={!!stockError}
                message={stockError}
                onClose={() => setStockError(null)}
            />
        </>
    );
};

export default Navbar;