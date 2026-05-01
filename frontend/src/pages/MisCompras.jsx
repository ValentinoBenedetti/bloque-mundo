import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPedidosRequest } from '../api/pedidos';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewModal from '../components/ReviewModal';
import { Calendar, Hash, ChevronDown } from 'lucide-react';

const MisCompras = () => {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' o 'asc'
    
    // Estados para la reseña
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const data = await getPedidosRequest();

                // Extraer todas las lineas de todos los pedidos y agregarles la fecha del pedido padre
                let allItems = [];
                data.forEach(pedido => {
                    if (pedido.lineas) {
                        pedido.lineas.forEach(linea => {
                            allItems.push({
                                ...linea,
                                fechaPedido: pedido.fecha,
                                idPedido: pedido.idPedido
                            });
                        });
                    }
                });

                setCompras(allItems);
            } catch (error) {
                console.error("Error al traer compras:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistorial();
    }, []);

    const comprasOrdenadas = [...compras].sort((a, b) => {
        const dateA = new Date(a.fechaPedido).getTime();
        const dateB = new Date(b.fechaPedido).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <section className="relative h-64 bg-slate-900 flex flex-col items-center justify-center text-white">
                <img
                    src="https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=2071&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                    alt="Banner Mis Compras"
                />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-bold mb-2">Mis compras</h2>
                    <p className="text-sm font-medium opacity-80">Inicio {'>'} Mis compras</p>
                </div>
            </section>

            <div className="bg-brand-yellow w-full py-4 px-10 shadow-sm border-b border-yellow-500">
                <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
                    <div className="relative w-48">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-white appearance-none w-full pr-10 pl-4 py-2 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200 transition outline-none focus:border-brand-red cursor-pointer"
                        >
                            <option value="desc">Descendente</option>
                            <option value="asc">Ascendente</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        {/* Agregamos una etiqueta arriba visual como en el diseño (opcional) */}
                        <div className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-500 font-bold uppercase pointer-events-none">Orden por fecha</div>
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                        Total: {compras.length}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-4xl mx-auto w-full py-12 px-6">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-40 bg-slate-200 rounded-lg w-full"></div>
                        <div className="h-40 bg-slate-200 rounded-lg w-full"></div>
                    </div>
                ) : comprasOrdenadas.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl font-bold text-slate-400">Aún no has realizado ninguna compra 🧱</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comprasOrdenadas.map((item, index) => {
                            const producto = item.producto;
                            const imagen = producto?.imagen || producto?.imagenes || producto?.image || 'https://placehold.co/300x300/f1f5f9/64748b?text=Lego+Producto';

                            return (
                                <div key={index} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
                                    <div className="h-28 w-28 bg-slate-100 rounded-md overflow-hidden shrink-0 flex items-center justify-center p-2">
                                        <img src={imagen} alt={producto?.titulo} className="object-contain w-full h-full mix-blend-multiply" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <h3 className="font-bold text-lg text-slate-800">
                                            {producto?.titulo} <span className="text-slate-500 text-sm font-medium">x{item.cantidad}</span>
                                        </h3>
                                        <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
                                            <div className="flex flex-col gap-1">
                                                <Hash size={18} className="text-slate-800" />
                                                <span>Codigo: {producto?.codigoProducto || producto?.idProducto}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Calendar size={18} className="text-slate-800" />
                                                <span>Fecha: {formatDate(item.fechaPedido)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full sm:w-48 mt-4 sm:mt-0">
                                        <button
                                            onClick={() => navigate(`/producto/${producto?.idProducto}`)}
                                            className="w-full text-center border-2 border-slate-300 text-slate-800 font-bold py-2 rounded text-sm hover:border-brand-red hover:text-brand-red transition"
                                        >
                                            Volver a comprar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedPurchase(item);
                                                setIsModalOpen(true);
                                            }}
                                            className="w-full text-center border border-slate-200 text-slate-400 font-medium py-2 rounded text-sm hover:bg-slate-50 hover:text-slate-600 transition"
                                        >
                                            Opinar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {comprasOrdenadas.length > 5 && (
                            <div className="flex justify-center mt-8">
                                <button className="bg-white border border-slate-300 text-slate-700 px-8 py-2 font-bold rounded text-sm hover:bg-slate-50 transition">
                                    Ver más
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />

            {selectedPurchase && (
                <ReviewModal 
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedPurchase(null);
                    }}
                    product={selectedPurchase.producto}
                    idPedido={selectedPurchase.idPedido}
                    onSuccess={() => {
                        alert("¡Gracias por tu reseña!");
                    }}
                />
            )}
        </div>
    );
};

export default MisCompras;
