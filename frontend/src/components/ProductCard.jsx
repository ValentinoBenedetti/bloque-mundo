import { Calendar, Package, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const ProductCard = ({ product, onMouseEnter, onMouseLeave }) => {
    const navigate = useNavigate();
    const { isAuthenticated, openAuthModal } = useAuth();

    // TRAEMOS EL CONTEXTO DE FAVORITOS
    const { toggleFavorite, isFavorite } = useFavorites();

    const idSeguro = product.id || product.idProducto || product.id_producto || product.productoId;
    const nombre = product.titulo || product.nombre;
    const precio = product.precio || product.price;
    const imagen = product.imagen || product.imagenes || product.image;
    const edad = product.rangoEdad || product.edad;
    const piezas = product.cantidadPiezas || product.piezas;

    // Verificamos si este producto está likeado
    const isFav = isFavorite(idSeguro);

    const formatPrice = (p) => {
        if (!p) return '$0';
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p);
    };

    const handleHeartClick = (e) => {
        e.stopPropagation(); // Evita que al tocar el corazón te lleve a otra página

        // 🔥 ACÁ ESTÁ LA MAGIA: Le pasamos el ID, no el objeto entero.
        // Si no tenés "idSeguro" en este archivo, probá con "product.id" o "product.idProducto"
        const idParaMandar = idSeguro;

        if (!isAuthenticated) {
            openAuthModal(() => toggleFavorite(idParaMandar));
            return;
        }

        toggleFavorite(idParaMandar);
    };

    return (
        <div 
            onClick={() => product.estado !== 'NoPublicado' && navigate(`/producto/${idSeguro}`)} 
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`bg-white border border-slate-200 rounded-md overflow-hidden hover:shadow-xl transition-all duration-300 group ${product.estado === 'NoPublicado' ? 'cursor-default' : 'cursor-pointer'} flex flex-col h-full relative`}
        >

            {/* BOTÓN CORAZÓN */}
            <button onClick={handleHeartClick} className="absolute top-3 right-3 z-20 transition-all hover:scale-110">
                <Heart size={24} strokeWidth={1.5} className={`transition-colors duration-300 ${isFav ? 'text-brand-red fill-brand-red' : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-brand-red'}`} />
            </button>

            {/* BADGE DE STOCK BAJO */}
            {product.estado === 'Publicado' && product.stock > 0 && product.stock <= 3 && (
                <div className="absolute top-3 left-3 z-20">
                    <span className="bg-brand-yellow text-slate-900 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded shadow-sm border border-brand-yellow/50">
                        {product.stock === 1 ? '¡Última unidad!' : 'Últimas unidades'}
                    </span>
                </div>
            )}

            <div className="h-64 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <img src={imagen || 'https://via.placeholder.com/300'} alt={nombre} className="object-contain h-full w-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                
                {product.estado === 'NoPublicado' && (
                    <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                         <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded shadow-xl rotate-[-5deg] border-2 border-white">
                            Publicación en pausa
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <button className="bg-white border border-slate-900 text-slate-900 text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded hover:bg-slate-900 hover:text-white transition-colors">
                        Ver detalles
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col grow bg-white z-10">
                <div className="flex gap-4 text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5"><Calendar size={18} strokeWidth={1} /><span className="text-sm">{edad || '---'}</span></div>
                    <div className="flex items-center gap-1.5"><Package size={18} strokeWidth={1} /><span className="text-sm">{piezas || '---'}</span></div>
                </div>
                <h3 className="text-base font-bold text-slate-800 leading-tight mb-4 group-hover:text-brand-red transition-colors">{nombre || 'Set sin nombre'}</h3>
                <div className="mt-auto"><span className="text-sm font-black text-slate-900">{formatPrice(precio)}</span></div>
            </div>
        </div>
    );
};

export default ProductCard;