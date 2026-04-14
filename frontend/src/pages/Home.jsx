import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProductsRequest } from '../api/products'; // Importamos la conexión real
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const data = await getProductsRequest();
                setProducts(data); // Guardamos los productos reales de la DB
                setError(false);
            } catch (err) {
                console.error("Error al conectar con el backend:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Carrusel Novedades */}
            <section className="relative h-[450px] bg-slate-900 flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img
                    src="https://www.lego.com/cdn/cs/set/assets/blt8446b5d63ec200d6/City_Main_Hero_Standard_Background.jpg"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    alt="Banner"
                />
                <div className="relative z-20 text-center space-y-6 px-4">
                    <h2 className="text-4xl font-bold tracking-tight uppercase italic">Novedades</h2>
                    <div className="flex gap-4 justify-center items-center max-w-5xl mx-auto">
                        <ChevronLeft size={40} className="cursor-pointer opacity-50 hover:opacity-100 hidden md:block" />
                        <div className="hidden md:block w-64 h-40 bg-slate-800/50 rounded-lg border border-white/20"></div>
                        <div className="w-80 h-48 bg-slate-700 rounded-lg shadow-2xl border-4 border-white transform scale-110 z-20 flex items-center justify-center text-xs italic">Imagen Novedad</div>
                        <div className="hidden md:block w-64 h-40 bg-slate-800/50 rounded-lg border border-white/20"></div>
                        <ChevronRight size={40} className="cursor-pointer opacity-50 hover:opacity-100 hidden md:block" />
                    </div>
                    <button className="bg-transparent border-2 border-white px-10 py-2 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition active:scale-95">
                        Comprar
                    </button>
                </div>
            </section>

            {/* Catálogo Principal */}
            <main className="max-w-7xl mx-auto w-full py-12 px-6">

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-red mx-auto"></div>
                        <p className="mt-4 text-slate-500 font-bold">Buscando bloques...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-red-600 font-bold">No se pudo conectar con el servidor.</p>
                        <p className="text-sm text-red-400">¿Está prendido el backend en el puerto 3000?</p>
                    </div>
                ) : (
                    <>
                        {/* Destacados (Primeros 3 de la DB) */}
                        <div className="mb-20">
                            <h2 className="text-2xl font-bold text-center mb-10 text-slate-800 uppercase tracking-tight">Productos destacados</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} />)}
                            </div>
                        </div>

                        {/* Resto de los productos */}
                        <div>
                            <h2 className="text-2xl font-bold text-center mb-10 text-slate-800 uppercase tracking-tight">Todos los productos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {products.map(p => <ProductCard key={p.id} product={p} />)}
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Home;