import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProductsRequest } from '../api/products'; // Importamos la conexión real
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeNovedadIndex, setActiveNovedadIndex] = useState(0);
    const [destacadoIndex, setDestacadoIndex] = useState(0);
    const [hoveredDestacadoId, setHoveredDestacadoId] = useState(null);

    const navigate = useNavigate();

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

    // --- Lógica del Carrusel de Novedades ---
    const novedades = products.filter(p => p.esNovedad && p.estado === 'Publicado');

    const handlePrevNovedad = () => {
        if (novedades.length > 0) {
            setActiveNovedadIndex(prev => (prev - 1 + novedades.length) % novedades.length);
        }
    };

    const handleNextNovedad = () => {
        if (novedades.length > 0) {
            setActiveNovedadIndex(prev => (prev + 1) % novedades.length);
        }
    };

    // --- Lógica del Carrusel de Destacados ---
    const destacados = products.filter(p => p.esDestacado && p.estado === 'Publicado');

    const handlePrevDestacado = () => {
        setDestacadoIndex(prev => Math.max(prev - 1, 0));
    };

    const handleNextDestacado = () => {
        setDestacadoIndex(prev => Math.min(prev + 1, Math.max(0, destacados.length - 4)));
    };

    const currentNovedad = novedades.length > 0 ? novedades[activeNovedadIndex] : null;
    const prevNovedad = novedades.length > 1 ? novedades[(activeNovedadIndex - 1 + novedades.length) % novedades.length] : currentNovedad;
    const nextNovedad = novedades.length > 2 ? novedades[(activeNovedadIndex + 1) % novedades.length] : (novedades.length > 1 ? prevNovedad : currentNovedad);

    const hoveredDestacadoProduct = destacados.find(p => p.idProducto === hoveredDestacadoId);
    const hoveredImgUrl = hoveredDestacadoProduct ? (hoveredDestacadoProduct.imagen || hoveredDestacadoProduct.imagenes || hoveredDestacadoProduct.image) : null;

    const renderCarouselBox = (novedad, type) => {
        if (!novedad) return <div className="hidden md:block w-64 h-40 bg-slate-800/50 rounded-lg border border-white/20"></div>;
        
        const isCenter = type === 'center';
        const imgUrl = novedad.imagen || novedad.imagenes || novedad.image || 'https://placehold.co/300x300/f1f5f9/64748b?text=Lego+Producto';

        if (isCenter) {
            return (
                <div className="w-80 h-48 bg-slate-700 rounded-lg shadow-2xl border-4 border-white transform scale-110 z-20 flex flex-col items-center justify-end overflow-hidden relative group">
                    <img src={imgUrl} alt={novedad.titulo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="relative z-10 w-full bg-linear-to-t from-black/90 to-transparent pt-8 pb-3 px-2 text-center text-white">
                        <p className="font-bold text-sm truncate drop-shadow-md">{novedad.titulo}</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="hidden md:flex w-64 h-40 bg-slate-800/50 rounded-lg border border-white/20 overflow-hidden relative opacity-50 hover:opacity-80 transition duration-300">
                    <img src={imgUrl} alt={novedad.titulo} className="absolute inset-0 w-full h-full object-cover" />
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Carrusel Novedades */}
            {novedades.length > 0 && (
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
                            <ChevronLeft onClick={handlePrevNovedad} size={40} className="cursor-pointer opacity-50 hover:opacity-100 hidden md:block transition" />
                            {renderCarouselBox(prevNovedad, 'side')}
                            {renderCarouselBox(currentNovedad, 'center')}
                            {renderCarouselBox(nextNovedad, 'side')}
                            <ChevronRight onClick={handleNextNovedad} size={40} className="cursor-pointer opacity-50 hover:opacity-100 hidden md:block transition" />
                        </div>
                        <button 
                            onClick={() => currentNovedad && navigate(`/producto/${currentNovedad.idProducto}`)}
                            className="bg-transparent border-2 border-white px-10 py-2 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition active:scale-95"
                        >
                            Comprar
                        </button>
                    </div>
                </section>
            )}

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
                        {/* Destacados (Filtrados por esDestacado) */}
                        {destacados.length > 0 && (
                            <div className={`mb-20 relative py-10 px-4 -mx-4 md:px-12 md:-mx-12 rounded-3xl transition-colors duration-700 ${hoveredImgUrl ? 'bg-slate-50' : 'bg-transparent'}`}>
                                {/* Fondo dinámico cuando se hace hover */}
                                <div 
                                    className={`absolute inset-0 z-0 overflow-hidden rounded-3xl transition-opacity duration-700 pointer-events-none ${hoveredImgUrl ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    {hoveredImgUrl && (
                                        <img 
                                            src={hoveredImgUrl} 
                                            alt="" 
                                            className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 transform scale-110" 
                                        />
                                    )}
                                    {/* Overlay sutil para mejorar el contraste */}
                                    <div className="absolute inset-0 bg-white/40"></div>
                                </div>

                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold text-center mb-10 text-slate-800 uppercase tracking-tight">Productos destacados</h2>
                                    <div className="relative md:px-12">
                                        <button 
                                            onClick={handlePrevDestacado}
                                            disabled={destacadoIndex === 0}
                                            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg shadow-slate-200/50 rounded-full p-2 text-slate-800 hover:text-brand-red hover:bg-slate-50 disabled:opacity-0 disabled:cursor-not-allowed transition duration-300"
                                        >
                                            <ChevronLeft size={30} />
                                        </button>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                            {destacados.slice(destacadoIndex, destacadoIndex + 4).map(p => (
                                                <ProductCard 
                                                    key={p.idProducto} 
                                                    product={p} 
                                                    onMouseEnter={() => setHoveredDestacadoId(p.idProducto)}
                                                    onMouseLeave={() => setHoveredDestacadoId(null)}
                                                />
                                            ))}
                                        </div>

                                        <button 
                                            onClick={handleNextDestacado}
                                            disabled={destacadoIndex >= Math.max(0, destacados.length - 4)}
                                            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg shadow-slate-200/50 rounded-full p-2 text-slate-800 hover:text-brand-red hover:bg-slate-50 disabled:opacity-0 disabled:cursor-not-allowed transition duration-300"
                                        >
                                            <ChevronRight size={30} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resto de los productos */}
                        <div>
                            <h2 className="text-2xl font-bold text-center mb-10 text-slate-800 uppercase tracking-tight">Todos los productos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {products.filter(p => p.estado === 'Publicado').map(p => <ProductCard key={p.idProducto} product={p} />)}
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