import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProductsRequest } from '../api/products';
import { SlidersHorizontal, ChevronDown, XCircle } from 'lucide-react';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

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
        if (!query) {
            setFilteredProducts(products);
            return;
        }

        // EL ARREGLO ESTÁ ACÁ: Le decimos que busque en la columna "titulo"
        const fuse = new Fuse(products, {
            keys: ['titulo', 'categoria'],
            threshold: 0.4,
            distance: 100,
        });

        const results = fuse.search(query);
        setFilteredProducts(results.map(result => result.item));
    }, [query, products]);

    const clearSearch = () => {
        setSearchParams({});
    };

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
                        <button className="bg-white flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 border border-slate-200 transition">
                            <SlidersHorizontal size={16} /> Filtrar
                        </button>
                        {['Categoría', 'Tema', 'Precio', 'Edad'].map((filtro) => (
                            <button key={filtro} className="bg-white flex items-center gap-6 px-4 py-2 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200 transition">
                                {filtro} <ChevronDown size={14} className="text-slate-400" />
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                        Mostrando {filteredProducts.length} de {products.length} resultados
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
                            {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
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