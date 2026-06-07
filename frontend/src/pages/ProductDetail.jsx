import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Calendar, Package, Hash, Star, StarHalf, Minus, Plus, Maximize, Shapes, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
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

    const { addToCart, setIsCartOpen, setStockError } = useCart();
    const { isAuthenticated, openAuthModal, user } = useAuth();

    // Función para decodificar el token y verificar si es admin
    const isAdmin = (() => {
        try {
            if (!user) return false;
            if (typeof user === 'object') return user.esAdmin === true;
            const base64Url = user.split('.')[1];
            if (!base64Url) return false;
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload).esAdmin === true;
        } catch (e) {
            return false;
        }
    })();

    // 🔥 2. TRAEMOS LAS FUNCIONES GLOBALES
    const { toggleFavorite, isFavorite } = useFavorites();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [resenas, setResenas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);

    const handleMouseMove = (e) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    useEffect(() => {
        setIsZoomed(false);
    }, [isLightboxOpen, lightboxIndex]);

    const imagesCount = product?.imagenes?.length || 1;

    useEffect(() => {
        if (!isLightboxOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % imagesCount);
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, imagesCount]);

    useEffect(() => {
        if (!mainImage) return;
        
        // Reset to white by default
        setBgColor('#ffffff');
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = mainImage;
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, 100, 100);
                    // Sample slightly inside the corner (e.g. 5, 5) to avoid edge anti-aliasing or compression artifacts
                    const data = ctx.getImageData(5, 5, 1, 1).data;
                    const [r, g, b, a] = data;
                    if (a > 200) {
                        setBgColor(`rgb(${r}, ${g}, ${b})`);
                    } else {
                        setBgColor('#ffffff');
                    }
                }
            } catch (e) {
                // If it fails (e.g. CORS), keep default white
                setBgColor('#ffffff');
            }
        };
        img.onerror = () => {
            setBgColor('#ffffff');
        };
    }, [mainImage]);

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

                    const themeId = foundProduct.tema?.idTema;
                    let relatedProducts = [];
                    
                    if (themeId) {
                        relatedProducts = allProducts.filter(p => {
                            const pId = p.id || p.idProducto || p.id_producto || p.productoId || p.ID;
                            return String(pId) !== String(id) && p.tema?.idTema === themeId;
                        });
                    }

                    // Si no tiene tema o no hay productos con ese mismo tema, mostramos otros como fallback
                    if (relatedProducts.length === 0) {
                        relatedProducts = allProducts.filter(p => {
                            const pId = p.id || p.idProducto || p.id_producto || p.productoId || p.ID;
                            return String(pId) !== String(id);
                        });
                    }

                    setRelated(relatedProducts.slice(0, 4));
                }

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
            <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex items-center justify-center">
                <Loader text="Buscando detalle del producto..." />
            </main>
            <Footer />
            </div>
        );
    }

    if (!product || product.estado === 'NoPublicado') {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
                        <p className="text-2xl font-bold text-slate-800 mb-4">
                            {product?.estado === 'NoPublicado' ? 'Publicación en pausa' : 'Set no encontrado'}
                        </p>
                        <p className="text-slate-500 mb-8">
                            {product?.estado === 'NoPublicado' 
                                ? 'Lo sentimos, este set no se encuentra disponible para la venta en este momento.' 
                                : 'El producto que buscas no existe o fue eliminado.'}
                        </p>
                        <button
                            onClick={() => navigate('/tienda')}
                            className="bg-brand-red text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-red-700 transition"
                        >
                            Volver a la tienda
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
    
    // Código visual a mostrar
    const codigoVisual = product.codigoProducto || product.codigoCombo || product.codigo || idReal;

    // 🔥 3. CONSULTAMOS SI YA ESTÁ GUARDADO
    const isFav = isFavorite(idReal);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            openAuthModal(async () => {
                try {
                    await addToCart(product, quantity);
                    setIsCartOpen(true);
                } catch (err) {
                    setStockError(err.message || "No hay suficiente stock disponible");
                }
            });
            return;
        }

        try {
            await addToCart(product, quantity);
            setIsCartOpen(true);
        } catch (err) {
            setStockError(err.message || "No hay suficiente stock disponible");
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

    const allImages = product.imagenes && product.imagenes.length > 0 
        ? product.imagenes 
        : [imagen];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <div className="bg-brand-yellow w-full py-4 px-10 border-b border-yellow-500">
                <div className="max-w-7xl mx-auto flex text-sm text-slate-800 gap-2 items-center flex-wrap">
                    <Link to="/" className="hover:text-brand-red transition">Inicio</Link>
                    <span className="font-bold text-xs">&gt;</span>
                    {product.categoria && (
                        <>
                            <Link to={`/tienda?categoria=${encodeURIComponent(product.categoria)}`} className="hover:text-brand-red transition">{product.categoria}</Link>
                            <span className="font-bold text-xs">&gt;</span>
                        </>
                    )}
                    {product.tema?.nombre && (
                        <>
                            <Link to={`/tienda?tema=${encodeURIComponent(product.tema.nombre)}`} className="hover:text-brand-red transition">{product.tema.nombre}</Link>
                            <span className="font-bold text-xs">&gt;</span>
                        </>
                    )}
                    <span className="font-bold truncate">{titulo}</span>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-6">
                <div className="flex flex-col md:flex-row gap-16 mb-24 items-start">
                    <div className="flex gap-6 w-full md:w-3/5">
                        {allImages.length > 1 && (
                            <div className="hidden lg:flex flex-col gap-4">
                                {allImages.map((imgUrl, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setMainImage(imgUrl)}
                                        className={`w-20 h-20 bg-slate-50 rounded border p-2 cursor-pointer transition ${mainImage === imgUrl ? 'border-brand-red ring-2 ring-brand-red/20' : 'border-slate-200 hover:border-brand-red'}`}
                                    >
                                        <img src={imgUrl} className="w-full h-full object-contain mix-blend-multiply" alt="thumb" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div 
                            className="flex-1 rounded-xl relative flex items-center justify-center group border border-slate-100 w-full aspect-square overflow-hidden transition-colors duration-500"
                            style={{ backgroundColor: bgColor }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img src={mainImage} alt={titulo} className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                            </div>
                            <button 
                                onClick={() => {
                                    const idx = allImages.indexOf(mainImage);
                                    setLightboxIndex(idx !== -1 ? idx : 0);
                                    setIsLightboxOpen(true);
                                }}
                                className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-xl text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-brand-red z-10"
                            >
                                <Maximize size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-2/5 flex flex-col justify-center">
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

                        <div className="flex flex-col mb-6">
                            <div className="flex items-center gap-4 mb-1">
                                <span className="text-3xl font-black text-brand-red">{formatPrice(precio)}</span>
                                <div className="h-6 w-[2px] bg-slate-200"></div>
                                {resenas.length > 0 ? (
                                    (() => {
                                        const average = resenas.reduce((acc, r) => acc + r.estrellas, 0) / resenas.length;
                                        const roundedAverage = Math.round(average * 2) / 2;
                                        const fullStars = Math.floor(roundedAverage);
                                        const hasHalfStar = roundedAverage % 1 !== 0;
                                        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

                                        return (
                                            <div className="flex items-center gap-1 text-brand-yellow">
                                                {[...Array(fullStars)].map((_, i) => (
                                                    <Star key={`full-${i}`} size={18} className="fill-current" />
                                                ))}
                                                {hasHalfStar && <StarHalf key="half" size={18} className="fill-current" />}
                                                {[...Array(emptyStars)].map((_, i) => (
                                                    <Star key={`empty-${i}`} size={18} className="text-slate-200" />
                                                ))}
                                                <span className="text-slate-400 text-xs font-bold ml-2">({roundedAverage.toLocaleString('es-AR')})</span>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <span className="text-slate-400 text-xs font-bold italic">Este producto aún no tiene reseñas</span>
                                )}
                            </div>
                            <span className="text-sm font-semibold text-slate-400">
                                Precio sin impuestos nacionales: <span className="font-bold text-slate-600">{formatPrice(precio / 1.21)}</span>
                            </span>
                        </div>
                        
                        {product.stock > 0 && product.stock <= 10 && (
                            <div className="mb-6">
                                <span className="bg-brand-yellow/20 text-slate-900 text-[11px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded-lg border border-brand-yellow/30 inline-flex items-center gap-2 animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                                    {product.stock === 1 
                                        ? '¡Última unidad disponible!' 
                                        : product.stock <= 5 
                                            ? `Últimas ${product.stock} unidades disponibles` 
                                            : 'Últimas unidades disponibles'}
                                </span>
                            </div>
                        )}

                        {product.stock === 0 && (
                            <div className="mb-6">
                                <span className="bg-red-50 text-brand-red text-[11px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded-lg border border-brand-red/30 inline-flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                                    Sin stock
                                </span>
                            </div>
                        )}

                        <p className="text-slate-500 text-sm leading-relaxed mb-10 whitespace-pre-wrap">
                            {product.descripcion || (
                                <>
                                    Este set de colección de <span className="font-bold text-slate-800">Bloque Mundo</span> es perfecto para aquellos que buscan un desafío de construcción único. Con detalles realistas y piezas de alta calidad, es ideal tanto para jugar como para exhibir.
                                </>
                            )}
                        </p>

                        {/* DETALLES DEL COMBO (PRODUCTOS INCLUIDOS Y AHORRO) */}
                        {product.esCombo && product.productos && product.productos.length > 0 && (
                            <div className="mb-8 p-5 bg-gradient-to-br from-yellow-50/50 to-orange-50/20 rounded-2xl border-2 border-dashed border-brand-yellow/30 shadow-sm">
                                <h3 className="text-sm font-black text-slate-800 uppercase italic mb-4 tracking-wider flex items-center gap-2">
                                    <Shapes size={18} className="text-brand-yellow" />
                                    Este combo incluye:
                                </h3>
                                <div className="space-y-3 mb-5">
                                    {product.productos.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white/60 p-2.5 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 shrink-0 flex items-center justify-center border border-slate-100">
                                                    <img 
                                                        src={item.imagen || item.imagenes || item.image || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop'} 
                                                        className="w-full h-full object-contain mix-blend-multiply" 
                                                        alt="combo-item" 
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{item.titulo || item.nombre}</h4>
                                                        {Number(item.stock) === 0 && (
                                                            <span className="bg-red-50 text-brand-red text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-brand-red/10">
                                                                Sin stock
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Cantidad: 1 u.</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-extrabold text-slate-500">{formatPrice(item.precio)}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {(() => {
                                    const sumPrices = product.productos.reduce((sum, p) => sum + Number(p.precio), 0);
                                    const savings = sumPrices - Number(product.precio);
                                    if (savings > 0) {
                                        return (
                                            <div className="border-t border-slate-200 pt-4 space-y-3">
                                                <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                                                    <span>PRECIO REGULAR COMPRADO POR SEPARADO:</span>
                                                    <span className="line-through text-slate-400 text-sm font-extrabold">{formatPrice(sumPrices)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                                    <span>PRECIO FINAL DE ESTE COMBO:</span>
                                                    <span className="text-slate-900 text-sm font-extrabold">{formatPrice(product.precio)}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-brand-red/5 p-3 rounded-xl border border-brand-red/10">
                                                    <div className="flex items-center gap-2">
                                                        <Tag size={16} className="text-brand-red animate-pulse" />
                                                        <span className="text-xs font-black text-brand-red uppercase italic">¡TU AHORRO COMPRANDO EL COMBO!</span>
                                                    </div>
                                                    <span className="text-base font-black text-brand-red bg-white px-3 py-1 rounded-lg shadow-sm border border-brand-red/10">
                                                        {formatPrice(savings)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 mb-10 py-8 border-y border-slate-100">
                            <div className="flex flex-col items-center text-center">
                                <Calendar size={28} className="text-slate-800 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Edad</span>
                                <span className="text-sm font-bold text-slate-800">{String(edad).includes('+') ? edad : `${edad}+`}</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Package size={28} className="text-slate-800 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Piezas</span>
                                <span className="text-sm font-bold text-slate-800">{piezas}</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Hash size={28} className="text-slate-800 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Código</span>
                                <span className="text-sm font-bold text-slate-800">{String(codigoVisual).startsWith('CMB') ? codigoVisual : `#${codigoVisual}`}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex items-center border-2 border-slate-200 rounded-lg bg-white overflow-hidden">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition"><Minus size={18} /></button>
                                <span className="w-10 text-center font-black text-slate-900 text-lg">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition"><Plus size={18} /></button>
                            </div>

                            <button
                                onClick={product.stock === 0 ? null : handleAddToCart}
                                disabled={product.stock === 0}
                                className={`flex-1 font-black py-4 rounded-lg shadow-lg uppercase tracking-widest text-sm italic transition-all ${
                                    product.stock === 0 
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                                    : 'bg-brand-red text-white hover:bg-red-700 active:scale-95'
                                }`}
                            >
                                {product.stock === 0 ? 'Sin stock' : 'Añadir al carrito'}
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
                                {resenas.slice(0, visibleReviewsCount).map((resena) => (
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
                                                {isAdmin ? resena.usuario.nombre.charAt(0) : 'A'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 italic uppercase">
                                                    {isAdmin ? `${resena.usuario.nombre} ${resena.usuario.apellido}` : 'Anónimo'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Comprador verificado</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {resenas.length > visibleReviewsCount && (
                                    <div className="flex justify-center mt-8">
                                        <button 
                                            onClick={() => setVisibleReviewsCount(prev => prev + 3)}
                                            className="bg-white border-2 border-brand-red text-brand-red px-8 py-2.5 font-bold rounded-full hover:bg-brand-red hover:text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer text-sm"
                                        >
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

            {/* LIGHTBOX MODAL */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsLightboxOpen(false)}>
                    <button className="absolute top-6 right-6 text-slate-400 hover:text-brand-red transition p-3 bg-slate-100 hover:bg-slate-200 rounded-full shadow-sm" onClick={() => setIsLightboxOpen(false)}>
                        <X size={28} />
                    </button>
                    
                    {allImages.length > 1 && (
                        <button className="absolute left-6 md:left-12 text-slate-400 hover:text-brand-red transition p-4 bg-slate-100 hover:bg-slate-200 rounded-full shadow-sm" onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length); }}>
                            <ChevronLeft size={32} />
                        </button>
                    )}

                    <div 
                        className="w-[80vw] h-[80vh] flex items-center justify-center overflow-hidden relative select-none" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setIsZoomed(!isZoomed); 
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setIsZoomed(false)}
                    >
                        <img 
                            src={allImages[lightboxIndex]} 
                            className={`w-full h-full object-contain mix-blend-multiply drop-shadow-2xl select-none transition-transform duration-200 ${isZoomed ? 'scale-[2.5] cursor-zoom-out' : 'scale-100 cursor-zoom-in animate-in zoom-in-95'}`} 
                            style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transitionDuration: '50ms' } : {}}
                            alt="Fullscreen" 
                        />
                    </div>

                    {allImages.length > 1 && (
                        <button className="absolute right-6 md:right-12 text-slate-400 hover:text-brand-red transition p-4 bg-slate-100 hover:bg-slate-200 rounded-full shadow-sm" onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % allImages.length); }}>
                            <ChevronRight size={32} />
                        </button>
                    )}

                    {allImages.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-slate-100" onClick={(e) => e.stopPropagation()}>
                            {allImages.map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setLightboxIndex(i)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === lightboxIndex ? 'bg-brand-red scale-125' : 'bg-slate-200 hover:bg-slate-300'}`} 
                                    aria-label={`Ver imagen ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDetail;