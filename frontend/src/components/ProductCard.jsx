import { Calendar, Box } from 'lucide-react';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white border border-slate-300 rounded-md overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
            {/* Imagen */}
            <div className="h-64 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.nombre}
                    className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Cuerpo de la tarjeta */}
            <div className="p-4 space-y-3">
                {/* Edad y Piezas */}
                <div className="flex gap-4 text-slate-600">
                    <div className="flex items-center gap-1">
                        <Calendar size={18} />
                        <span className="text-lg font-medium">{product.edad || '7'}+</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Box size={18} />
                        <span className="text-lg font-medium">{product.piezas || '0'}</span>
                    </div>
                </div>

                {/* Nombre y Precio */}
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 leading-tight">{product.nombre}</h3>
                    <p className="text-xl font-bold text-slate-900 mt-1">${product.precio?.toLocaleString('es-AR')}</p>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;