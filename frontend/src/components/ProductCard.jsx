import { Calendar, Package, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    // BLINDAJE DE VARIABLES (Buscamos todas las combinaciones posibles de tu DB)
    const idSeguro = product.id || product.idProducto || product.id_producto || product.productoId;
    const nombre = product.titulo || product.nombre;
    const precio = product.precio || product.price;
    const imagen = product.imagen || product.imagenes || product.image;
    const edad = product.rangoEdad || product.edad;
    const piezas = product.cantidadPiezas || product.piezas;

    const formatPrice = (p) => {
        if (!p) return '$0';
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(p);
    };

    return (
        <div
            // ACÁ USAMOS EL ID SEGURO
            onClick={() => navigate(`/producto/${idSeguro}`)}
            className="bg-white border border-slate-200 rounded-md overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full relative"
        >
            <button className="absolute top-3 right-3 z-20 text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                <Heart size={24} strokeWidth={1.5} />
            </button>

            <div className="h-64 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <img
                    src={imagen || 'https://via.placeholder.com/300?text=Falta+Foto'}
                    alt={nombre}
                    className="object-contain h-full w-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <button className="bg-white border border-slate-900 text-slate-900 text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded hover:bg-slate-900 hover:text-white transition-colors">
                        Ver detalles
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col grow bg-white z-10">
                <div className="flex gap-4 text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={18} strokeWidth={1} />
                        <span className="text-sm">{edad ? `${edad}` : '---'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Package size={18} strokeWidth={1} />
                        <span className="text-sm">{piezas || '---'}</span>
                    </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 leading-tight mb-4 group-hover:text-brand-red transition-colors">
                    {nombre || 'Set sin nombre'}
                </h3>

                <div className="mt-auto">
                    <span className="text-sm font-black text-slate-900">
                        {formatPrice(precio)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;