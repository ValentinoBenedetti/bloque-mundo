import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProductsRequest } from '../api/products';
import { SlidersHorizontal, ChevronDown, XCircle, ChevronRight } from 'lucide-react';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        categoria: '',
        tema: '',
        precio: '',
        rangoEdad: ''
    });
    const [sortBy, setSortBy] = useState('');

    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const priceRef = useRef(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

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
        const fetchProducts = async () => {
            try {
                const data = await getProductsRequest();
                setProducts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        // Filtrar solo productos con estado 'Publicado'
        let results = products.filter(p => p.estado === 'Publicado');

        if (query) {
            const fuse = new Fuse(results, {
                keys: ['titulo', 'categoria', 'tema.nombre'],
                threshold: 0.4,
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
        if (filters.precio) {
            const [minStr, maxStr] = filters.precio.split('-');
            const min = minStr ? Number(minStr) : 0;
            const max = maxStr ? Number(maxStr) : Infinity;
            results = results.filter(p => Number(p.precio) >= min && Number(p.precio) <= max);
        }

        if (sortBy === 'asc') {
            results.sort((a, b) => Number(a.precio) - Number(b.precio));
        } else if (sortBy === 'desc') {
            results.sort((a, b) => Number(b.precio) - Number(a.precio));
        }

        setFilteredProducts(results);
    }, [query, products, filters, sortBy]);

    const clearSearch = () => {
        setSearchParams({});
    };

    const clearFilters = () => {
        setFilters({ categoria: '', tema: '', precio: '', rangoEdad: '' });
        setSortBy('');
    };

    const categoriasUnicas = Array.from(new Set(products.map(p => p.categoria).filter(Boolean)));
    const temasUnicos = Array.from(new Set(products.map(p => p.tema?.nombre).filter(Boolean)));
    const edadesUnicas = Array.from(new Set(products.map(p => p.rangoEdad).filter(Boolean)));

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <section className="relative h-64 bg-slate-900 flex flex-col items-center justify-center text-white">
                <img
                    src="https://www.lego.com/cdn/cs/set/assets/blt8446b5d63ec200d6/City_Main_Hero_Standard_Background.jpg"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                    alt="Banner Tienda"
                />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-bold mb-2">Tienda</h2>
                    <p className="text-sm font-medium opacity-80">Inicio {'>'} Tienda</p>
                </div>
            </section>

            <div className="bg-brand-yellow w-full py-4 px-10 shadow-sm border-b border-yellow-500">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={clearFilters}
                            className="bg-white flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 border border-slate-200 transition"
                        >
                            <SlidersHorizontal size={16} /> Limpiar Filtros
                        </button>

                        {/* CATEGORÍA */}
                        <div className="relative">
                            <select
                                value={filters.categoria}
                                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                                className="bg-white appearance-none pr-10 pl-4 py-2 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200 transition outline-none focus:border-brand-red cursor-pointer"
                            >
                                <option value="">Categoría</option>
                                {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* TEMA */}
                        <div className="relative">
                            <select
                                value={filters.tema}
                                onChange={(e) => setFilters({ ...filters, tema: e.target.value })}
                                className="bg-white appearance-none pr-10 pl-4 py-2 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200 transition outline-none focus:border-brand-red cursor-pointer"
                            >
                                <option value="">Tema</option>
                                {temasUnicos.map(tema => <option key={tema} value={tema}>{tema}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* PRECIO */}
                        <div className="relative" ref={priceRef}>
                            <button
                                onClick={() => setIsPriceOpen(!isPriceOpen)}
                                className="bg-white flex items-center justify-between gap-4 px-4 py-2 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200 transition outline-none cursor-pointer min-w-[120px]"
                            >
                                {filters.precio === '0-55000' ? 'Hasta $ 55.000' :
                                    filters.precio === '55000-95000' ? '$55k - $95k' :
                                        filters.precio === '95000-' ? 'Más de $ 95.000' :
                                            filters.precio ? 'Personalizado' : 'Precio'}
                                <ChevronDown size={14} className="text-slate-400" />
                            </button>

                            {isPriceOpen && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-50 border border-slate-200 shadow-xl rounded-lg p-5 z-50">
                                    <h4 className="font-bold text-slate-800 mb-4 text-base">Precio</h4>

                                    <div className="space-y-3 mb-6">
                                        <button
                                            onClick={() => { setFilters({ ...filters, precio: '0-55000' }); setIsPriceOpen(false); }}
                                            className="block w-full text-left text-sm text-slate-600 hover:text-brand-red font-medium transition"
                                        >
                                            Hasta $ 55.000
                                        </button>
                                        <button
                                            onClick={() => { setFilters({ ...filters, precio: '55000-95000' }); setIsPriceOpen(false); }}
                                            className="block w-full text-left text-sm text-slate-600 hover:text-brand-red font-medium transition"
                                        >
                                            $ 55.000 a $ 95.000
                                        </button>
                                        <button
                                            onClick={() => { setFilters({ ...filters, precio: '95000-' }); setIsPriceOpen(false); }}
                                            className="block w-full text-left text-sm text-slate-600 hover:text-brand-red font-medium transition"
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
                                            className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:border-brand-red bg-white"
                                        />
                                        <span className="text-slate-400">—</span>
                                        <input
                                            type="number"
                                            placeholder="Máximo"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:border-brand-red bg-white"
                                        />
                                        <button
                                            onClick={() => {
                                                setFilters({ ...filters, precio: `${minPrice || 0}-${maxPrice || ''}` });
                                                setIsPriceOpen(false);
                                            }}
                                            className="bg-slate-200 p-2 rounded-full hover:bg-brand-red hover:text-white transition text-white shrink-0"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* EDAD */}
                        <div className="relative">
                            <select
                                value={filters.rangoEdad}
                                onChange={(e) => setFilters({ ...filters, rangoEdad: e.target.value })}
                                className="bg-white appearance-none pr-10 pl-4 py-2 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200 transition outline-none focus:border-brand-red cursor-pointer"
                            >
                                <option value="">Edad</option>
                                {edadesUnicas.map(edad => <option key={edad} value={edad}>{edad}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* ORDENAR */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white appearance-none pr-10 pl-4 py-2 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200 transition outline-none focus:border-brand-red cursor-pointer"
                            >
                                <option value="">Ordenar</option>
                                <option value="asc">Menor precio</option>
                                <option value="desc">Mayor precio</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                        Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
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
                            {filteredProducts.map(p => <ProductCard key={p.idProducto} product={p} />)}
                        </div>

                        <div className="flex justify-center mt-12">
                            <button className="bg-white border-2 border-slate-300 text-slate-800 px-8 py-2 font-bold rounded hover:border-brand-red hover:text-brand-red transition">
                                Ver más
                            </button>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Store;