import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 🔥 Importamos SweetAlert2
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProductsRequest } from '../api/products'; // Importamos la conexión real
import { ChevronLeft, ChevronRight, Filter, ShoppingCart, Star, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [destacadoIndex, setDestacadoIndex] = useState(0);
    const [hoveredDestacadoId, setHoveredDestacadoId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(8);

    const navigate = useNavigate();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(price);
    };

    // 🔥 Detectar sesión expirada (401 global)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('session_expired') === 'true') {
            Swal.fire({
                icon: 'warning',
                title: '¡Sesión Expirada!',
                text: 'Tu sesión ha expirado por seguridad o inactividad. Por favor, iniciá sesión nuevamente.',
                confirmButtonColor: '#E11D48',
                confirmButtonText: 'Entendido'
            });
            // Limpiar la URL sin recargar la página
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, []);

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
    const novedades = products.filter(p => p.esNovedad && p.estado === 'Publicado').sort((a,b) => (a.stock===0?1:0) - (b.stock===0?1:0));

    // --- Lógica del Carrusel de Destacados ---
    const destacados = products.filter(p => p.esDestacado && p.estado === 'Publicado').sort((a,b) => (a.stock===0?1:0) - (b.stock===0?1:0));

    const handlePrevDestacado = () => {
        setDestacadoIndex(prev => Math.max(prev - 1, 0));
    };

    const handleNextDestacado = () => {
        setDestacadoIndex(prev => Math.min(prev + 1, Math.max(0, destacados.length - 4)));
    };


    const hoveredDestacadoProduct = destacados.find(p => p.idProducto === hoveredDestacadoId);
    const hoveredImgUrl = hoveredDestacadoProduct ? (hoveredDestacadoProduct.imagen || hoveredDestacadoProduct.imagenes || hoveredDestacadoProduct.image) : null;

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Carrusel Novedades - Estilo Swiper Professional */}
            {novedades.length > 0 && (
                <section className="relative py-20 bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden">
                    {/* Fondo con Blur Dinámico */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/assets/banners/novedades.png"
                            className="w-full h-full object-cover opacity-30 blur-sm scale-110"
                            alt="Background Blur"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-6xl px-4 text-center mb-6">
                        <motion.h2 
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter drop-shadow-lg"
                        >
                            Novedades
                        </motion.h2>
                        <p className="text-slate-400 font-medium tracking-widest uppercase text-[10px] mt-1">Lanzamientos recientes</p>
                    </div>

                    <div className="relative z-10 w-full max-w-7xl px-4">
                        <Swiper
                            slidesPerView={1}
                            spaceBetween={0}
                            centeredSlides={true}
                            loop={true}
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                            }}
                            breakpoints={{
                                768: { slidesPerView: 3 },
                            }}
                            pagination={{ 
                                clickable: true,
                                el: '.novedades-custom-pagination'
                            }}
                            navigation={true}
                            modules={[Pagination, Navigation, Autoplay]}
                            className="novedades-swiper w-full !overflow-visible py-16"
                        >
                            {novedades.map((item) => (
                                <SwiperSlide key={item.idProducto} className="!flex items-center justify-center py-4">
                                    <div 
                                        onClick={() => navigate(`/producto/${item.idProducto}`)}
                                        className="bg-white border border-slate-200 rounded-md p-4 hover:shadow-xl transition-all duration-300 group cursor-pointer mx-auto w-full max-w-[340px]"
                                    >
                                        <div className="aspect-square overflow-hidden rounded-md flex items-center justify-center mb-4">
                                            <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                                <img
                                                    src={item.imagenes?.[0] || item.imagen || '/placeholder.png'}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                    alt={item.titulo}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-brand-red drop-shadow-sm">
                                                {formatPrice(item.precio)}
                                            </p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Paginación fuera del carrusel */}
                        <div className="novedades-custom-pagination flex justify-center items-center gap-2 mt-12"></div>
                    </div>

                    <style>{`
                        .novedades-swiper {
                            overflow: visible !important;
                        }
                        .novedades-swiper .swiper-slide {
                            transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                            transform: scale(0.7);
                            filter: blur(4px) grayscale(0.7);
                            opacity: 0.4;
                            pointer-events: none;
                        }
                        .novedades-swiper .swiper-slide-active {
                            transform: scale(1.1);
                            filter: blur(0) grayscale(0);
                            opacity: 1;
                            z-index: 50;
                            pointer-events: auto;
                        }
                        .swiper-card-content {
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                            border: 1px solid rgba(255,255,255,0.1);
                        }
                        .novedades-custom-pagination .swiper-pagination-bullet {
                            background: #fff;
                            opacity: 0.2;
                            width: 12px;
                            height: 12px;
                            margin: 0 !important;
                            transition: all 0.3s ease;
                        }
                        .novedades-custom-pagination .swiper-pagination-bullet-active {
                            background: #ffcc00;
                            opacity: 1;
                            width: 40px;
                            border-radius: 6px;
                        }
                        .novedades-swiper .swiper-button-next,
                        .novedades-swiper .swiper-button-prev {
                            color: #ffcc00;
                            transform: scale(0.6);
                            top: 50% !important;
                            z-index: 100;
                        }
                    `}</style>
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
                            <div className="mb-20 py-10 px-4 -mx-4 md:px-12 md:-mx-12 rounded-3xl">
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
                                {products
                                    .filter(p => p.estado === 'Publicado')
                                    .sort((a, b) => (a.stock === 0 ? 1 : 0) - (b.stock === 0 ? 1 : 0))
                                    .slice(0, visibleCount)
                                    .map(p => <ProductCard key={p.idProducto} product={p} />)}
                            </div>

                            {visibleCount < products.filter(p => p.estado === 'Publicado').length && (
                                <div className="flex justify-center mt-12">
                                    <button 
                                        onClick={() => setVisibleCount(prev => prev + 8)}
                                        className="bg-white border-2 border-brand-red text-brand-red px-8 py-2.5 font-bold rounded-full hover:bg-brand-red hover:text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
                                    >
                                        Ver más
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Home;