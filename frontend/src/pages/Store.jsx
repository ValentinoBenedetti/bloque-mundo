import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProductsRequest } from '../api/products';
import { getTemasRequest } from '../api/temas';
import { SlidersHorizontal, ChevronDown, XCircle, ChevronRight } from 'lucide-react';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [temasAPI, setTemasAPI] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const temaQuery = searchParams.get('tema') || '';
    const catQuery = searchParams.get('categoria') || '';

    const [filters, setFilters] = useState({
        categoria: catQuery,
        tema: temaQuery,
        precio: '',
        rangoEdad: '',
        stock: '' // 'disponible', 'nodisponible', ''
    });
    const [sortBy, setSortBy] = useState('');
    const [visibleCount, setVisibleCount] = useState(8);

    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const priceRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (priceRef.current && !priceRef.current.contains(event.target)) {
                setIsPriceOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [prodsData, temasData] = await Promise.all([
                    getProductsRequest(),
                    getTemasRequest()
                ]);
                setProducts(prodsData);
                setTemasAPI(temasData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        // Filtrar solo productos con estado 'Publicado'
        let results = products.filter(p => p.estado === 'Publicado');

        if (query) {
            const fuse = new Fuse(results, {
                keys: ['titulo', 'categoria', 'tema.nombre'],
                threshold: 0.3,
                distance: 100,
            });
            results = fuse.search(query).map(result => result.item);
        }

        if (filters.categoria) {
            results = results.filter(p => p.categoria === filters.categoria);
        }
        if (filters.tema) {
            results = results.filter(p => p.tema?.nombre === filters.tema);
        }
        if (filters.rangoEdad) {
            results = results.filter(p => p.rangoEdad === filters.rangoEdad);
        }
        if (filters.stock) {
            if (filters.stock === 'disponible') {
                results = results.filter(p => p.stock > 0);
            } else if (filters.stock === 'nodisponible') {
                results = results.filter(p => p.stock === 0);
            }
        }
        if (filters.precio) {
            const [minStr, maxStr] = filters.precio.split('-');
            const min = minStr ? Number(minStr) : 0;
            const max = maxStr ? Number(maxStr) : Infinity;
            results = results.filter(p => Number(p.precio) >= min && Number(p.precio) <= max);
        }

        results.sort((a, b) => {
            const noStockA = a.stock === 0 ? 1 : 0;
            const noStockB = b.stock === 0 ? 1 : 0;
            if (noStockA !== noStockB) return noStockA - noStockB;

            if (sortBy === 'asc') return Number(a.precio) - Number(b.precio);
            if (sortBy === 'desc') return Number(b.precio) - Number(a.precio);
            return 0;
        });

        setFilteredProducts(results);
        setVisibleCount(8);
    }, [query, products, filters, sortBy]);

    const clearSearch = () => {
        setSearchParams({});
    };

    const clearFilters = () => {
        setFilters({ categoria: '', tema: '', precio: '', rangoEdad: '', stock: '' });
        setSortBy('');
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('tema');
        newParams.delete('categoria');
        setSearchParams(newParams);
    };

    const categoriasBase = [
        "Animales", "Arquitectura", "Botánica", "Castillos", "Ciudad", 
        "Construcción Básica", "Edificios", "Espacio", "Fantasía", "Mecanismos", 
        "Minifiguras", "Naves", "Películas y TV", "Piratas", 
        "Robótica", "Series", "Sets de Colección", "Superhéroes", "Trenes", 
        "Vehículos", "Videojuegos"
    ];
    const categoriasUnicas = Array.from(new Set([...categoriasBase, ...products.map(p => p.categoria).filter(Boolean)])).sort();
    const temasUnicos = temasAPI.length > 0 
        ? temasAPI.map(t => t.nombre) 
        : Array.from(new Set(products.map(p => p.tema?.nombre).filter(Boolean)));
    const edadesUnicas = Array.from(new Set(products.map(p => p.rangoEdad).filter(Boolean)));

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <section className="relative h-64 bg-slate-900 flex flex-col items-center justify-center text-white">
                <img
                    src="/assets/banners/tienda.png"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                    alt="Banner Tienda"
                />
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl font-black uppercase italic tracking-tight drop-shadow-lg">
                        Tienda
                    </h1>
                    <p className="text-sm font-medium text-slate-300 mt-2">
                        Inicio{' '}
                        <span className="text-slate-400 mx-1">›</span>
                        Tienda
                    </p>
                </div>
            </section>

            <div className="bg-slate-900 w-full py-5 px-10 shadow-xl border-t-4 border-t-brand-yellow border-b border-b-slate-800">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={clearFilters}
                            className="bg-slate-800 hover:bg-brand-yellow hover:text-slate-900 hover:border-brand-yellow flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-slate-100 border border-slate-700 transition duration-200 shadow-sm shrink-0"
                        >
                            <SlidersHorizontal size={16} /> Limpiar Filtros
                        </button>

                        {/* CATEGORÍA */}
                        <div className="relative min-w-[140px] group">
                            <select
                                value={filters.categoria}
                                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${filters.categoria ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer w-full`}
                            >
                                <option value="" className="bg-slate-900 text-slate-300">Categoría</option>
                                {categoriasUnicas.map(cat => <option key={cat} value={cat} className="bg-slate-900 text-slate-100">{cat}</option>)}
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${filters.categoria ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>

                        {/* TEMA */}
                        <div className="relative min-w-[140px] group">
                            <select
                                value={filters.tema}
                                onChange={(e) => setFilters({ ...filters, tema: e.target.value })}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${filters.tema ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer w-full`}
                            >
                                <option value="" className="bg-slate-900 text-slate-300">Tema</option>
                                {temasUnicos.map(tema => <option key={tema} value={tema} className="bg-slate-900 text-slate-100">{tema}</option>)}
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${filters.tema ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>

                        {/* PRECIO */}
                        <div className="relative group" ref={priceRef}>
                            <button
                                onClick={() => setIsPriceOpen(!isPriceOpen)}
                                className={`bg-slate-800 hover:bg-slate-700 flex items-center justify-between gap-4 px-5 py-2 rounded-full text-sm font-semibold border ${filters.precio ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer min-w-[120px]`}
                            >
                                {filters.precio === '0-55000' ? 'Hasta $ 55.000' :
                                    filters.precio === '55000-95000' ? '$55k - $95k' :
                                        filters.precio === '95000-' ? 'Más de $ 95.000' :
                                            filters.precio ? 'Personalizado' : 'Precio'}
                                <ChevronDown size={14} className={`transition-colors duration-200 ${filters.precio ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                            </button>

                            {isPriceOpen && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-5 z-50">
                                    <h4 className="font-bold text-slate-200 mb-4 text-base">Precio</h4>

                                    <div className="space-y-3 mb-6">
                                        <button
                                            onClick={() => { setFilters({ ...filters, precio: '0-55000' }); setIsPriceOpen(false); }}
                                            className="block w-full text-left text-sm text-slate-300 hover:text-brand-yellow font-medium transition"
                                        >
                                            Hasta $ 55.000
                                        </button>
                                        <button
                                            onClick={() => { setFilters({ ...filters, precio: '55000-95000' }); setIsPriceOpen(false); }}
                                            className="block w-full text-left text-sm text-slate-300 hover:text-brand-yellow font-medium transition"
                                        >
                                            $ 55.000 a $ 95.000
                                        </button>
                                        <button
                                            onClick={() => { setFilters({ ...filters, precio: '95000-' }); setIsPriceOpen(false); }}
                                            className="block w-full text-left text-sm text-slate-300 hover:text-brand-yellow font-medium transition"
                                        >
                                            Más de $ 95.000
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Mínimo"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full p-2 border border-slate-750 rounded-lg text-sm outline-none focus:border-brand-yellow bg-slate-800 text-slate-100 placeholder:text-slate-500"
                                        />
                                        <span className="text-slate-500">—</span>
                                        <input
                                            type="number"
                                            placeholder="Máximo"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full p-2 border border-slate-750 rounded-lg text-sm outline-none focus:border-brand-yellow bg-slate-800 text-slate-100 placeholder:text-slate-500"
                                        />
                                        <button
                                            onClick={() => {
                                                setFilters({ ...filters, precio: `${minPrice || 0}-${maxPrice || ''}` });
                                                setIsPriceOpen(false);
                                            }}
                                            className="bg-brand-yellow p-2 rounded-full hover:bg-yellow-500 text-slate-900 transition shrink-0"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* EDAD */}
                        <div className="relative min-w-[100px] group">
                            <select
                                value={filters.rangoEdad}
                                onChange={(e) => setFilters({ ...filters, rangoEdad: e.target.value })}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${filters.rangoEdad ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer w-full`}
                            >
                                <option value="" className="bg-slate-900 text-slate-300">Edad</option>
                                {edadesUnicas.map(edad => <option key={edad} value={edad} className="bg-slate-900 text-slate-100">{edad}</option>)}
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${filters.rangoEdad ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>

                        {/* STOCK */}
                        <div className="relative min-w-[140px] group">
                            <select
                                value={filters.stock}
                                onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${filters.stock ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer w-full`}
                            >
                                <option value="" className="bg-slate-900 text-slate-300">Stock: Todos</option>
                                <option value="disponible" className="bg-slate-900 text-slate-100">Disponible</option>
                                <option value="nodisponible" className="bg-slate-900 text-slate-100">Sin stock</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${filters.stock ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>

                        {/* ORDENAR */}
                        <div className="relative min-w-[120px] group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${sortBy ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer w-full`}
                            >
                                <option value="" className="bg-slate-900 text-slate-300">Ordenar</option>
                                <option value="asc" className="bg-slate-900 text-slate-100">Menor precio</option>
                                <option value="desc" className="bg-slate-900 text-slate-100">Mayor precio</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${sortBy ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-400">
                        Mostrando <span className="text-brand-yellow font-black text-base">{Math.min(visibleCount, filteredProducts.length)}</span> de <span className="text-brand-yellow font-black text-base">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-6">
                {query && (
                    <div className="mb-8 flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-800">
                            Resultados para: <span className="text-brand-red">"{query}"</span>
                        </h3>
                        <button
                            onClick={clearSearch}
                            className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-red transition"
                        >
                            <XCircle size={16} /> Limpiar
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-80 bg-slate-100 rounded-lg"></div>)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl font-bold text-slate-400">No encontramos ningún bloque que coincida 🧱</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.slice(0, visibleCount).map(p => <ProductCard key={p.idProducto} product={p} />)}
                        </div>

                        {visibleCount < filteredProducts.length && (
                            <div className="flex justify-center mt-12">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 8)}
                                    className="bg-white border-2 border-brand-red text-brand-red px-8 py-2.5 font-bold rounded-full hover:bg-brand-red hover:text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
                                >
                                    Ver más
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Store;