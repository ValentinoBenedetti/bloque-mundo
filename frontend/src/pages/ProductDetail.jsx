import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Calendar, Package, Hash, Star, Minus, Plus, Maximize } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProductsRequest } from '../api/products';
import { getResenasRequest } from '../api/resenas';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// 🔥 1. IMPORTAMOS EL CONTEXTO DE FAVORITOS
import { useFavorites } from '../context/FavoritesContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { addToCart, setIsCartOpen } = useCart();
    const { isAuthenticated, openAuthModal } = useAuth();

    // 🔥 2. TRAEMOS LAS FUNCIONES GLOBALES
    const { toggleFavorite, isFavorite } = useFavorites();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [resenas, setResenas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!id || id === 'undefined') {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const allProducts = await getProductsRequest();

                const foundProduct = allProducts.find(p => {
                    const pId = p.id || p.idProducto || p.id_producto || p.productoId || p.ID || p._id;
                    return String(pId) === String(id);
                });

                if (foundProduct) {
                    setProduct(foundProduct);
                    setMainImage(foundProduct.imagen || foundProduct.imagenes || foundProduct.image || foundProduct.url_imagen);
                    
                    // Y" TRAEMOS LAS RESEAS DEL PRODUCTO
                    const prodId = foundProduct.id || foundProduct.idProducto || foundProduct.id_producto || foundProduct.productoId;
                    const res = await getResenasRequest(prodId);
                    setResenas(res);
                }

                setRelated(allProducts.filter(p => {
                    const pId = p.id || p.idProducto || p.id_producto || p.productoId || p.ID;
                    return String(pId) !== String(id);
                }).slice(0, 4));

            } catch (err) {
                console.error("❌ Error fatal cargando productos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-red"></div>
                        <p className="text-slate-500 font-bold animate-pulse">Cargando set {id}...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10 text-center">
                    <div className="text-8xl">🧱</div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase italic">¡Ups! Bloque perdido</h2>
                    <p className="text-slate-500 max-w-md">
                        No pudimos encontrar el set con ID <span className="font-bold text-brand-red">#{id}</span> en nuestra base de datos.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/tienda')} className="bg-brand-red text-white px-8 py-3 rounded-md font-bold hover:bg-red-700 transition shadow-lg uppercase tracking-widest text-sm">
                            Ir a la tienda
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const formatPrice = (p) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p || 0);

    const titulo = product.titulo || product.nombre || 'Set de Colección';
    const precio = product.precio || product.price || 0;
    const imagen = product.imagen || product.imagenes || product.image || 'https://via.placeholder.com/600?text=Bloque+Mundo';
    const edad = product.rangoEdad || product.edad || '9';
    const piezas = product.cantidadPiezas || product.piezas || '---';

    // Acá tomamos el ID real de 5 cifras que manda el Backend
    const idReal = product.id || product.idProducto || product.id_producto || id;

    // 🔥 3. CONSULTAMOS SI YA ESTÁ GUARDADO
    const isFav = isFavorite(idReal);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            openAuthModal(async () => {
                try {
                    await addToCart(product, quantity);
                    setIsCartOpen(true);
                } catch (err) {
                    alert(err.message || "Error al agregar al carrito");
                }
            });
            return;
        }

        try {
            await addToCart(product, quantity);
            setIsCartOpen(true);
        } catch (err) {
            alert(err.message || "Error al agregar al carrito");
        }
    };

    const handleFavorite = () => {
        if (!isAuthenticated) {
            openAuthModal(() => toggleFavorite(idReal));
            return;
        }

        // 🔥 4. MANDAMOS LA ORDEN CON EL ID CORRECTO
        toggleFavorite(idReal);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <div className="bg-brand-yellow w-full py-3 px-10 border-b border-yellow-500">
                <div className="max-w-7xl mx-auto flex text-[10px] font-black text-slate-800 uppercase tracking-widest gap-2 items-center">
                    <span className="cursor-pointer hover:text-brand-red transition" onClick={() => navigate('/')}>Inicio</span>
                    <span className="text-yellow-700">/</span>
                    <span className="cursor-pointer hover:text-brand-red transition" onClick={() => navigate('/tienda')}>Tienda</span>
                    <span className="text-yellow-700">/</span>
                    <span className="text-slate-500 truncate max-w-[150px]">{titulo}</span>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-6">
                <div className="flex flex-col md:flex-row gap-16 mb-24">
                    <div className="flex gap-6 md:w-3/5">
                        <div className="hidden lg:flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-20 h-20 bg-slate-50 rounded border border-slate-200 p-2 cursor-pointer hover:border-brand-red transition">
                                    <img src={imagen} className="w-full h-full object-contain mix-blend-multiply" alt="thumb" />
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-xl relative flex items-center justify-center p-12 group border border-slate-100 min-h-[500px]">
                            <img src={mainImage} alt={titulo} className="w-full h-full object-contain mix-blend-multiply transform group-hover:scale-110 transition-transform duration-700" />
                            <button className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-xl text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-brand-red">
                                <Maximize size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="md:w-2/5 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-5xl font-black text-slate-900 leading-none uppercase italic tracking-tighter">{titulo}</h1>

                            <button
                                onClick={handleFavorite}
                                className="p-2 hover:bg-slate-50 rounded-full transition group"
                            >
                                <Heart
                                    size={32}
                                    // 🔥 5. USAMOS LA VARIABLE isFav QUE VIENE DEL CONTEXTO
                                    className={`transition-colors duration-300 ${isFav ? 'text-brand-red fill-brand-red' : 'text-slate-300 group-hover:text-brand-red'}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-3xl font-black text-brand-red">{formatPrice(precio)}</span>
                            <div className="h-6 w-[2px] bg-slate-200"></div>
                            <div className="flex items-center gap-1 text-brand-yellow">
                                <Star size={18} className="fill-current" />
                                <Star size={18} className="fill-current" />
                                <Star size={18} className="fill-current" />
                                <Star size={18} className="fill-current" />
                                <Star size={18} className="text-slate-200" />
                                <span className="text-slate-400 text-xs font-bold ml-2">(4)</span>
                            </div>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed mb-10">
                            Este set de colección de <span className="font-bold text-slate-800">Bloque Mundo</span> es perfecto para aquellos que buscan un desafío de construcción único. Con detalles realistas y piezas de alta calidad, es ideal tanto para jugar como para exhibir.
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-10 py-8 border-y border-slate-100">
                            <div className="flex flex-col items-center text-center">
                                <Calendar size={28} className="text-slate-800 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Edad</span>
                                <span className="text-sm font-bold text-slate-800">+{edad}</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Package size={28} className="text-slate-800 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Piezas</span>
                                <span className="text-sm font-bold text-slate-800">{piezas}</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Hash size={28} className="text-slate-800 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Código</span>
                                <span className="text-sm font-bold text-slate-800">#{idReal}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex items-center border-2 border-slate-200 rounded-lg bg-white overflow-hidden">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition"><Minus size={18} /></button>
                                <span className="w-10 text-center font-black text-slate-900 text-lg">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition"><Plus size={18} /></button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-brand-red text-white font-black py-4 rounded-lg shadow-lg hover:bg-red-700 transition-all active:scale-95 uppercase tracking-widest text-sm italic"
                            >
                                Añadir al carrito
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN DE RESEÑAS --- */}
                <section className="py-24 border-t border-slate-100 bg-white/50 -mx-6 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <span className="text-brand-red font-black text-xs uppercase tracking-[0.3em]">Opiniones reales</span>
                                <h2 className="text-4xl font-black text-slate-900 italic uppercase">Reseñas [{resenas.length}]</h2>
                            </div>
                            {resenas.length > 0 && (
                                <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full">
                                    <div className="flex text-brand-yellow">
                                        <Star size={16} className="fill-current" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700">
                                        {(resenas.reduce((acc, r) => acc + r.estrellas, 0) / resenas.length).toFixed(1)} / 5.0
                                    </span>
                                </div>
                            )}
                        </div>

                        {resenas.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold italic">Aún no hay reseñas para este set. ¡Sé el primero en opinar!</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {resenas.map((resena) => (
                                    <div key={resena.idResena} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-hover hover:shadow-md">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-1 text-brand-yellow">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={18} 
                                                        className={i < resena.estrellas ? "fill-current" : "text-slate-200"} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Verificada</span>
                                        </div>
                                        
                                        <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                                            "{resena.comentario}"
                                        </p>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs">
                                                {resena.usuario.nombre.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 italic uppercase">
                                                    {resena.esAnonima ? 'Anónimo' : `${resena.usuario.nombre} ${resena.usuario.apellido}`}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Comprador verificado</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {resenas.length > 3 && (
                                    <div className="flex justify-center mt-8">
                                        <button className="bg-white border-2 border-slate-200 text-slate-400 font-black px-10 py-3 rounded-lg hover:border-brand-red hover:text-brand-red transition uppercase tracking-widest text-xs italic">
                                            Ver más reseñas
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <section className="pt-20 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-brand-red font-black text-xs uppercase tracking-[0.3em]">Más para armar</span>
                            <h2 className="text-4xl font-black text-slate-900 italic uppercase">Sets relacionados</h2>
                        </div>
                        <button onClick={() => navigate('/tienda')} className="text-slate-400 font-bold text-sm hover:text-brand-red transition border-b-2 border-transparent hover:border-brand-red pb-1">
                            Ver toda la tienda
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {related.length > 0 ? (
                            related.map(p => <ProductCard key={p.id || p.idProducto || p.id_producto || p.productoId} product={p} />)
                        ) : (
                            <p className="col-span-full text-center text-slate-300 italic">Cargando recomendaciones...</p>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetail;