import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPedidosRequest, confirmarCompraRequest, cancelarPedidoRequest } from '../api/pedidos';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewModal from '../components/ReviewModal';
import TrackingModal from '../components/TrackingModal';
import SuccessModal from '../components/SuccessModal';
import { Calendar, Hash, ChevronDown, Truck, Search, MessageSquare, ShoppingBag, Eye } from 'lucide-react';

const MisCompras = () => {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' o 'asc'
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('fecha'); // 'fecha' o 'monto'
    const [estadoFiltro, setEstadoFiltro] = useState('Todos');
    const [visibleCount, setVisibleCount] = useState(5);
    
    // Estados para la reseña
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    // Estado para el modal de éxito
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    // Estados para el seguimiento
    const [isTrackingOpen, setIsTrackingOpen] = useState(false);
    const [trackingPedido, setTrackingPedido] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                // Verificar si venimos de Mercado Pago
                const queryParams = new URLSearchParams(location.search);
                if (queryParams.get('status') === 'success') {
                    // Confirmar la compra para que vacíe el carrito y cree el pedido
                    try {
                        const savedCupon = localStorage.getItem('tempCuponCheckout');
                        const data = savedCupon ? { codigoCupon: savedCupon } : {};
                        await confirmarCompraRequest(data);
                        
                        // Limpiar la URL para que no lo haga de nuevo si refresca
                        window.history.replaceState({}, document.title, window.location.pathname);
                        localStorage.removeItem('tempCuponCheckout');
                    } catch (e) {
                        // Puede fallar si el carrito ya está vacío (ej. refrescó)
                        console.log('Compra ya procesada o error:', e);
                    }
                } else if (queryParams.get('status') === 'failure') {
                    // Cancelar el pedido si el pago falló o el usuario volvió atrás
                    const idPedido = queryParams.get('idPedido');
                    if (idPedido) {
                        try {
                            await cancelarPedidoRequest(idPedido);
                            window.history.replaceState({}, document.title, window.location.pathname);
                            localStorage.removeItem('tempCuponCheckout');
                        } catch (e) {
                            console.log('Error al cancelar pedido:', e);
                        }
                    }
                }

                const data = await getPedidosRequest();

                // Extraer todas las lineas de todos los pedidos y agregarles la fecha del pedido padre
                let allItems = [];
                data.forEach(pedido => {
                    if (pedido.lineas) {
                        // Calculamos el total de la suma de subtotales para saber el factor de descuento
                        const sumaSubtotales = pedido.lineas.reduce((acc, linea) => 
                            acc + (Number(linea.precioHistorico) * Number(linea.cantidad)), 0
                        );
                        
                        // Factor de descuento real (Total Pagado / Suma de Subtotales)
                        const factorDescuento = sumaSubtotales > 0 ? (Number(pedido.total) / sumaSubtotales) : 1;

                        pedido.lineas.forEach(linea => {
                            // Aplicamos el descuento proporcional a cada linea
                            const precioConDescuento = Number(linea.precioHistorico) * factorDescuento;
                            
                            allItems.push({
                                ...linea,
                                precioRealUnitario: precioConDescuento, // Precio unitario con descuento
                                totalRealLinea: precioConDescuento * Number(linea.cantidad), // Total linea con descuento
                                fechaPedido: pedido.fecha,
                                idPedido: pedido.idPedido,
                                estado: pedido.estado,
                                pedidoOriginal: pedido // Guardamos todo el pedido para el tracking
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

    const comprasFiltradas = compras.filter(item => {
        const itemComprado = item.producto || item.combo;
        if (!itemComprado) return false;

        if (estadoFiltro !== 'Todos' && item.estado !== estadoFiltro) return false;

        return itemComprado.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const comprasOrdenadas = [...comprasFiltradas].sort((a, b) => {
        if (sortBy === 'fecha') {
            const dateA = new Date(a.fechaPedido).getTime();
            const dateB = new Date(b.fechaPedido).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
            const totalA = Number(a.totalRealLinea);
            const totalB = Number(b.totalRealLinea);
            return sortOrder === 'desc' ? totalB - totalA : totalA - totalB;
        }
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    const visibleCompras = comprasOrdenadas.slice(0, visibleCount);

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
                    <h1 className="text-4xl font-black uppercase italic tracking-tight drop-shadow-lg">
                        Mis compras
                    </h1>
                    <p className="text-sm font-medium text-slate-300 mt-2">
                        Inicio{' '}
                        <span className="text-slate-400 mx-1">›</span>
                        Mis compras
                    </p>
                </div>
            </section>

            <div className="bg-slate-900 w-full py-5 px-10 shadow-xl border-t-4 border-t-brand-yellow border-b border-b-slate-800">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex gap-4 w-full sm:w-auto">
                        {/* Selector de Criterio */}
                        <div className="relative w-36 shrink-0 group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${sortBy !== "fecha" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="fecha" className="bg-slate-900 text-slate-100">Fecha</option>
                                <option value="monto" className="bg-slate-900 text-slate-100">Monto</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${sortBy !== "fecha" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                            <div className={`absolute -top-2 left-4 bg-slate-900 px-1.5 text-[9px] font-bold uppercase tracking-wider pointer-events-none transition-colors duration-200 ${sortBy !== "fecha" ? 'text-brand-yellow' : 'text-slate-400'}`}>Ordenar por</div>
                        </div>

                        {/* Selector de Dirección */}
                        <div className="relative w-40 shrink-0 group">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${sortOrder !== "desc" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="desc" className="bg-slate-900 text-slate-100">Descendente</option>
                                <option value="asc" className="bg-slate-900 text-slate-100">Ascendente</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${sortOrder !== "desc" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                            <div className={`absolute -top-2 left-4 bg-slate-900 px-1.5 text-[9px] font-bold uppercase tracking-wider pointer-events-none transition-colors duration-200 ${sortOrder !== "desc" ? 'text-brand-yellow' : 'text-slate-400'}`}>Dirección</div>
                        </div>

                        {/* Selector de Estado */}
                        <div className="relative w-36 shrink-0 group">
                            <select
                                value={estadoFiltro}
                                onChange={(e) => {
                                    setEstadoFiltro(e.target.value);
                                    setVisibleCount(5);
                                }}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${estadoFiltro !== "Todos" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="Todos" className="bg-slate-900 text-slate-100">Todos</option>
                                <option value="PAGADO" className="bg-slate-900 text-slate-100">Pagados</option>
                                <option value="PENDIENTE" className="bg-slate-900 text-slate-100">Pendientes</option>
                                <option value="CANCELADO" className="bg-slate-900 text-slate-100">Cancelados</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${estadoFiltro !== "Todos" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                            <div className={`absolute -top-2 left-4 bg-slate-900 px-1.5 text-[9px] font-bold uppercase tracking-wider pointer-events-none transition-colors duration-200 ${estadoFiltro !== "Todos" ? 'text-brand-yellow' : 'text-slate-400'}`}>Estado</div>
                        </div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="relative w-full sm:w-80 group">
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-6 pr-12 py-2.5 rounded-full text-sm font-semibold bg-slate-800 border ${searchTerm ? 'border-brand-yellow text-brand-yellow focus:ring-brand-yellow' : 'border-slate-700 text-slate-100 placeholder:text-slate-400 hover:border-brand-yellow focus:ring-brand-yellow'} outline-none focus:ring-2 transition`}
                        />
                        <Search size={16} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${searchTerm ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                    </div>

                    {/* Resultados */}
                    <div className="text-sm font-semibold text-slate-400 shrink-0">
                        Total: <span className="text-brand-yellow font-black text-base">{comprasFiltradas.length}</span>
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
                        {visibleCompras.map((item, index) => {
                            const itemComprado = item.producto || item.combo;
                            const isCombo = !!item.combo;
                            const imagen = isCombo 
                                ? (itemComprado?.imagen || (Array.isArray(itemComprado?.imagenes) ? itemComprado.imagenes[0] : itemComprado?.imagenes) || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop')
                                : (itemComprado?.imagen || (Array.isArray(itemComprado?.imagenes) ? itemComprado.imagenes[0] : itemComprado?.imagenes) || itemComprado?.image || 'https://placehold.co/300x300/f1f5f9/64748b?text=Lego+Producto');
                            
                            const idStr = isCombo ? `combo-${itemComprado?.idCombo}` : itemComprado?.idProducto;
                            const codigo = itemComprado?.codigoCombo || itemComprado?.codigoProducto || idStr;

                            return (
                                <div key={index} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
                                    <div className="h-28 w-28 bg-slate-100 rounded-md overflow-hidden shrink-0 flex items-center justify-center p-2">
                                        <img src={imagen} alt={itemComprado?.titulo} className="object-contain w-full h-full mix-blend-multiply" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <h3 className="font-bold text-lg text-slate-800">
                                            {itemComprado?.titulo} <span className="text-slate-500 text-sm font-medium">x{item.cantidad}</span>
                                        </h3>
                                        <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
                                            <div className="flex flex-col gap-1">
                                                <Hash size={18} className="text-slate-800" />
                                                <span>Codigo: {codigo}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Calendar size={18} className="text-slate-800" />
                                                <span>Fecha: {formatDate(item.fechaPedido)}</span>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                item.estado === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                                item.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                item.estado === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {item.estado}
                                            </div>
                                            {item.estado === 'PAGADO' && (
                                                <div className="flex flex-col gap-0 ml-4">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Pagaste</span>
                                                    <span className="text-lg font-black text-slate-900 leading-none mt-1">
                                                        ${(Number(item.totalRealLinea)).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full sm:w-48 mt-4 sm:mt-0">
                                        {item.estado === 'PAGADO' && (
                                            <button
                                                onClick={() => {
                                                    setTrackingPedido(item.pedidoOriginal);
                                                    setIsTrackingOpen(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 bg-brand-yellow text-slate-900 font-bold py-2 rounded text-sm hover:bg-yellow-400 transition shadow-sm"
                                            >
                                                <Truck size={16} />
                                                Seguir envío
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/producto/${idStr}`)}
                                            className={`w-full flex items-center justify-center gap-2 font-bold py-2 rounded text-sm transition shadow-sm ${
                                                item.estado === 'PAGADO' 
                                                ? 'bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white' 
                                                : 'bg-slate-800 border-2 border-slate-800 text-white hover:bg-white hover:text-slate-800'
                                            }`}
                                        >
                                            {item.estado === 'PAGADO' ? (
                                                <><Eye size={16} /> Ver producto</>
                                            ) : (
                                                <><ShoppingBag size={16} /> Comprar</>
                                            )}
                                        </button>
                                        {!isCombo && item.estado === 'PAGADO' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPurchase(item);
                                                    setIsModalOpen(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 font-bold py-2 rounded text-sm hover:bg-blue-600 hover:text-white transition shadow-sm"
                                            >
                                                <MessageSquare size={16} />
                                                Opinar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {comprasOrdenadas.length > visibleCount && (
                            <div className="flex justify-center mt-8">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 5)}
                                    className="bg-white border-2 border-brand-red text-brand-red px-8 py-2.5 font-bold rounded-full hover:bg-brand-red hover:text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer text-sm"
                                >
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
                    product={selectedPurchase.producto || selectedPurchase.combo}
                    idPedido={selectedPurchase.idPedido}
                    onSuccess={() => {
                        setIsSuccessOpen(true);
                    }}
                />
            )}

            <SuccessModal 
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="¡Reseña enviada!"
                message="Tu opinión es muy importante para nosotros y para toda la comunidad de Bloque Mundo."
                buttonText="Genial"
            />

            <TrackingModal 
                isOpen={isTrackingOpen}
                onClose={() => {
                    setIsTrackingOpen(false);
                    setTrackingPedido(null);
                }}
                pedido={trackingPedido}
            />
        </div>
    );
};

export default MisCompras;
