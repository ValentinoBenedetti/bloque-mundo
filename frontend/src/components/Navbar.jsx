import { useState, useEffect, useRef } from 'react';
import { Search, User, Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { getProductsRequest } from '../api/products'; // Traemos la API

const Navbar = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Nuevos estados para la búsqueda en vivo
    const [products, setProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Referencia para saber si el usuario hace clic afuera del buscador
    const searchRef = useRef(null);

    // 1. Cargar productos en segundo plano al iniciar la Navbar
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProductsRequest();
                setProducts(data);
            } catch (err) {
                console.error("Error cargando productos para el buscador", err);
            }
        };
        fetchProducts();
    }, []);

    // 2. Ejecutar la búsqueda mágica cada vez que el usuario teclea
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSuggestions([]);
            setIsDropdownOpen(false);
            return;
        }

        const fuse = new Fuse(products, {
            keys: ['titulo', 'categoria'], // Buscamos por título
            threshold: 0.4,
            distance: 100,
        });

        const results = fuse.search(searchTerm);
        // Tomamos solo los primeros 5 resultados para no hacer una lista eterna
        setSuggestions(results.map(result => result.item).slice(0, 5));
        setIsDropdownOpen(true);
    }, [searchTerm, products]);

    // 3. Cerrar el desplegable si hacen clic en cualquier otra parte de la pantalla
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Funciones de navegación
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

    const formatPrice = (p) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p || 0);
    };

    return (
        <nav className="bg-brand-red py-4 px-10 flex justify-between items-center shadow-lg sticky top-0 z-50">
            <h1
                className="text-3xl font-logo text-white tracking-widest cursor-pointer"
                onClick={() => navigate('/')}
            >
                Bloque Mundo
            </h1>

            <div className="hidden md:flex gap-10 text-white font-medium text-sm tracking-tight items-center">
                <button onClick={() => navigate('/')} className="hover:opacity-80 transition cursor-pointer">Inicio</button>
                <button onClick={() => navigate('/tienda')} className="hover:opacity-80 transition cursor-pointer font-bold">Tienda</button>
                <button className="hover:opacity-80 transition cursor-pointer">Nosotros</button>

                {/* CONTENEDOR DEL BUSCADOR (CON REFERENCIA PARA CLIC AFUERA) */}
                <div className="relative ml-4" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => searchTerm.trim() !== '' && setIsDropdownOpen(true)}
                        className="py-1.5 pl-4 pr-10 rounded-full text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow w-72 transition-all"
                    />
                    <Search
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-brand-red transition"
                        onClick={() => searchTerm.trim() !== '' && navigate(`/tienda?q=${searchTerm}`)}
                    />

                    {/* MENÚ DESPLEGABLE DE RESULTADOS EN VIVO */}
                    {isDropdownOpen && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col">
                            {suggestions.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSuggestionClick(item.titulo)}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none transition-colors"
                                >
                                    <img
                                        src={item.imagen || 'https://via.placeholder.com/50?text=Foto'}
                                        alt={item.titulo}
                                        className="w-10 h-10 object-contain mix-blend-multiply"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 truncate w-48">{item.titulo}</span>
                                        <span className="text-xs font-black text-brand-red">{formatPrice(item.precio)}</span>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => handleSuggestionClick(searchTerm)}
                                className="bg-slate-50 text-slate-500 text-xs font-bold py-2 hover:bg-brand-red hover:text-white transition-colors text-center"
                            >
                                Ver todos los resultados
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-6 text-white items-center">
                <User size={20} className="cursor-pointer hover:scale-110 transition" onClick={() => navigate('/perfil')} />
                <Heart size={20} className="cursor-pointer hover:scale-110 transition" />
                <ShoppingCart size={20} className="cursor-pointer hover:scale-110 transition" />
            </div>
        </nav>
    );
};

export default Navbar;