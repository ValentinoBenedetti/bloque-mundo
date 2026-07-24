import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getPedidosRequest, confirmarCompraRequest, cancelarPedidoRequest } from '../api/pedidos';
import { getUserStatusRequest } from '../api/usuarios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewModal from '../components/ReviewModal';
import TrackingModal from '../components/TrackingModal';
import SuccessModal from '../components/SuccessModal';
import CheckoutSuccessModal from '../components/CheckoutSuccessModal';
import CheckoutFailureModal from '../components/CheckoutFailureModal';
import LevelUpModal from '../components/LevelUpModal';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { Calendar, Hash, ChevronDown, Truck, Search, MessageSquare, ShoppingBag, Eye, X, Package } from 'lucide-react';

const decodificarToken = (token) => {
    try {
        if (!token) return null;
        if (typeof token === 'object') return token;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

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

    // Estados para el modal de éxito de la compra (Lego style)
    const [isCheckoutSuccessOpen, setIsCheckoutSuccessOpen] = useState(false);
    const [checkoutSuccessPedido, setCheckoutSuccessPedido] = useState(null);
    const [checkoutSuccessPaymentId, setCheckoutSuccessPaymentId] = useState('N/A');

    // Estado para compra fallida
    const [isCheckoutFailureOpen, setIsCheckoutFailureOpen] = useState(false);

    // Estados para el modal de nivel ascendido
    const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
    const [levelUpInfo, setLevelUpInfo] = useState(null);

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
                const statusParam = queryParams.get('status');
                const idPedidoStr = queryParams.get('idPedido') || queryParams.get('external_reference');
                const idPedido = idPedidoStr ? parseInt(idPedidoStr, 10) : null;

                let pedidoConfirmado = null;

                if (statusParam === 'success') {
                    // Confirmar la compra para que vacíe el carrito y cree el pedido
                    try {
                        const savedCupon = localStorage.getItem('tempCuponCheckout');
                        const data = {
                            ...(savedCupon ? { codigoCupon: savedCupon } : {}),
                            ...(idPedido ? { idPedido: idPedido } : {})
                        };
                        pedidoConfirmado = await confirmarCompraRequest(data);
                    } catch (e) {
                        // Puede fallar si el webhook ganó la carrera (lo cual es normal)
                        console.log('Compra ya procesada o error en confirmación:', e);
                    }
                    window.history.replaceState({}, document.title, window.location.pathname);
                    localStorage.removeItem('tempCuponCheckout');
                } else if (statusParam === 'failure') {
                    // Cancelar el pedido si el pago falló o el usuario volvió atrás
                    if (idPedido) {
                        try {
                            await cancelarPedidoRequest(idPedido);
                        } catch (e) {
                            console.log('Error al cancelar pedido:', e);
                        }
                    }
                    setIsCheckoutFailureOpen(true);
                    window.history.replaceState({}, document.title, window.location.pathname);
                    localStorage.removeItem('tempCuponCheckout');
                }

                const data = await getPedidosRequest();

                // Si fue un éxito, y no obtuvimos el pedidoConfirmado de la llamada directa (ej: webhook ya lo procesó),
                // lo buscamos entre los pedidos recién cargados utilizando el idPedido.
                if (statusParam === 'success') {
                    if (!pedidoConfirmado && idPedido && data.length > 0) {
                        pedidoConfirmado = data.find(p => p.idPedido === idPedido);
                    }

                    // Configurar y abrir el modal de éxito de la compra
                    const mpPaymentId = queryParams.get('payment_id') || 'N/A';
                    setCheckoutSuccessPaymentId(mpPaymentId);
                    setCheckoutSuccessPedido(pedidoConfirmado || { idPedido: idPedido || 'N/A', total: 0 });
                    setIsCheckoutSuccessOpen(true);

                    // 🔥 Disparar Confeti
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#D62828', '#ffcc00', '#2563eb', '#16a34a']
                    });

                    // Verificar si hubo ascenso de nivel
                    const savedUser = localStorage.getItem('usuarioBloqueMundo');
                    const token = savedUser ? JSON.parse(savedUser) : null;
                    const userData = decodificarToken(token);
                    const userId = userData?.sub || userData?.idUsuario;

                    if (userId) {
                        try {
                            const userStatus = await getUserStatusRequest(userId);
                            const prevLevelStr = localStorage.getItem('prevUserLevel');
                            if (prevLevelStr && userStatus?.nivelActual) {
                                const prevLevel = JSON.parse(prevLevelStr);
                                const newLevel = userStatus.nivelActual;

                                const getLevelNumber = (nombre) => {
                                    switch (nombre?.toLowerCase()) {
                                        case 'aprendiz': return 1;
                                        case 'constructor': return 2;
                                        case 'arquitecto': return 3;
                                        case 'experto': return 4;
                                        case 'maestro': return 5;
                                        default: return 1;
                                    }
                                };

                                const prevNum = getLevelNumber(prevLevel.nombre);
                                const newNum = getLevelNumber(newLevel.nombre);

                                if (newNum > prevNum) {
                                    setLevelUpInfo({
                                        show: true,
                                        prevLevel: prevLevel,
                                        newLevel: newLevel
                                    });
                                }
                            }
                        } catch (err) {
                            console.error("Error al verificar nivel en checkout success:", err);
                        } finally {
                            localStorage.removeItem('prevUserLevel');
                        }
                    }
                }

                setCompras(data);
            } catch (error) {
                console.error("Error al traer compras:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistorial();
    }, []);

    const comprasFiltradas = compras.filter(pedido => {
        if (estadoFiltro !== 'Todos' && pedido.estado !== estadoFiltro) return false;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesId = String(pedido.idPedido).includes(term);
            const matchesLineas = pedido.lineas?.some(linea => {
                const item = linea.producto || linea.combo;
                return item?.titulo?.toLowerCase().includes(term);
            });
            return matchesId || matchesLineas;
        }
        return true;
    });

    const comprasOrdenadas = [...comprasFiltradas].sort((a, b) => {
        if (sortBy === 'fecha') {
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
            const totalA = Number(a.total);
            const totalB = Number(b.total);
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

    const hasActiveFilters = searchTerm !== '' || sortBy !== 'fecha' || sortOrder !== 'desc' || estadoFiltro !== 'Todos';
    const clearFilters = () => {
        setSearchTerm('');
        setSortBy('fecha');
        setSortOrder('desc');
        setEstadoFiltro('Todos');
        setVisibleCount(5);
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
                    <h1 className="text-4xl font-black uppercase italic tracking-tight drop-shadow-lg">
                        Mis compras
                    </h1>
                    <p className="text-sm font-medium text-slate-300 mt-2">
                        <Link to="/" className="hover:text-brand-yellow transition-colors">Inicio</Link>{' '}
                        <span className="text-slate-400 mx-1">›</span>
                        <Link to="/mis-compras" className="hover:text-brand-yellow transition-colors">Mis compras</Link>
                    </p>
                </div>
            </section>

            <div className="bg-slate-900 w-full py-5 px-4 sm:px-10 shadow-xl border-t-4 border-t-brand-yellow border-b border-b-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row flex-wrap justify-between items-center gap-6">
                    <div className="flex gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-center sm:justify-start">
                        <button
                            onClick={clearFilters}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border transition duration-200 shadow-sm shrink-0 ${hasActiveFilters
                                    ? 'bg-brand-yellow text-slate-900 border-brand-yellow hover:bg-yellow-500'
                                    : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-brand-yellow hover:text-slate-900 hover:border-brand-yellow'
                                }`}
                        >
                            <X size={16} /> Limpiar Filtros
                        </button>
                        {/* Selector de Criterio */}
                        <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-48 group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${sortBy !== "fecha" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="fecha" className="bg-slate-900 text-slate-100">Ordenar por: Fecha</option>
                                <option value="monto" className="bg-slate-900 text-slate-100">Ordenar por: Monto</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${sortBy !== "fecha" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>

                        {/* Selector de Dirección (Orden) */}
                        <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-52 group">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${sortOrder !== "desc" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="desc" className="bg-slate-900 text-slate-100">
                                    {sortBy === 'fecha' ? 'Orden: Más nuevo' : 'Orden: Mayor precio'}
                                </option>
                                <option value="asc" className="bg-slate-900 text-slate-100">
                                    {sortBy === 'fecha' ? 'Orden: Más antiguo' : 'Orden: Menor precio'}
                                </option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${sortOrder !== "desc" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>

                        {/* Selector de Estado */}
                        <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-48 group">
                            <select
                                value={estadoFiltro}
                                onChange={(e) => {
                                    setEstadoFiltro(e.target.value);
                                    setVisibleCount(5);
                                }}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${estadoFiltro !== "Todos" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="Todos" className="bg-slate-900 text-slate-100">Por estado: Todos</option>
                                <option value="PAGADO" className="bg-slate-900 text-slate-100">Por estado: Pagados</option>
                                <option value="PENDIENTE" className="bg-slate-900 text-slate-100">Por estado: Pendientes</option>
                                <option value="CANCELADO" className="bg-slate-900 text-slate-100">Por estado: Cancelados</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${estadoFiltro !== "Todos" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="relative flex-1 min-w-[250px] max-w-md group">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o ID de pedido..."
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
                ) : compras.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl font-bold text-slate-400">Aún no has realizado ninguna compra 🧱</p>
                    </div>
                ) : comprasOrdenadas.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-2xl font-bold text-slate-400">No se encontraron pedidos con esos criterios.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {visibleCompras.map((pedido) => {
                            return (
                                <div key={pedido.idPedido} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-6">
                                    {/* Cabecera del Pedido */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-slate-800">
                                                <Truck size={20} className="text-brand-red" />
                                                <h3 className="font-bold text-lg leading-none">Pedido #{pedido.idPedido}</h3>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1.5">
                                                Fecha de compra: {formatDate(pedido.fecha)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 sm:gap-6">
                                            {/* Estados */}
                                            <div className="flex gap-4 sm:gap-6">
                                                <div className="flex flex-col gap-1.5 text-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Estado del Pedido</span>
                                                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide inline-block ${pedido.estado === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                                            pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                                pedido.estado === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {pedido.estado}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1.5 text-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Estado del Envío</span>
                                                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide inline-block ${pedido.envio?.estado === 'Entregado' ? 'bg-blue-100 text-blue-700' :
                                                            pedido.envio?.estado === 'En camino' ? 'bg-indigo-100 text-indigo-700' :
                                                                pedido.envio?.estado === 'Preparando' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {pedido.envio?.estado || 'PENDIENTE'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Total Pagado */}
                                            <div className="flex flex-col gap-1.5 text-right border-l border-slate-100 pl-4 sm:pl-6">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Total Pagado</span>
                                                <span className="text-xl font-black text-slate-900 leading-none">
                                                    ${(Number(pedido.total)).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cuerpo: Listado de Productos */}
                                    <div className="space-y-4">
                                        {pedido.lineas?.map((linea, idx) => {
                                            const itemComprado = linea.producto || linea.combo;
                                            const isCombo = !!linea.combo;
                                            const imagen = isCombo
                                                ? (itemComprado?.imagen || (Array.isArray(itemComprado?.imagenes) ? itemComprado.imagenes[0] : itemComprado?.imagenes) || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop')
                                                : (itemComprado?.imagen || (Array.isArray(itemComprado?.imagenes) ? itemComprado.imagenes[0] : itemComprado?.imagenes) || itemComprado?.image || 'https://placehold.co/300x300/f1f5f9/64748b?text=Lego+Producto');

                                            const idStr = isCombo ? `combo-${itemComprado?.idCombo}` : itemComprado?.idProducto;
                                            const codigo = itemComprado?.codigoCombo || itemComprado?.codigoProducto || idStr;

                                            return (
                                                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 transition">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-16 w-16 bg-white border border-slate-200 rounded overflow-hidden shrink-0 flex items-center justify-center p-1 relative group">
                                                            <img src={imagen} alt={itemComprado?.titulo} className="object-contain w-full h-full mix-blend-multiply" />
                                                            <span className="text-[8px] text-red-600 bg-white/90 absolute inset-0 break-all overflow-y-auto leading-tight z-10 hidden group-hover:block cursor-help font-mono p-0.5" title={String(imagen)}>
                                                                {String(imagen)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm text-slate-800">
                                                                {itemComprado?.titulo}
                                                            </h4>
                                                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                                                Cantidad: <span className="font-bold text-slate-700">{linea.cantidad}</span> • Código: {codigo}
                                                            </p>
                                                            <p className="text-xs font-bold text-slate-600 mt-1">
                                                                Precio: ${(Number(linea.precioHistorico)).toLocaleString()} c/u
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Acciones individuales por producto */}
                                                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                        <button
                                                            onClick={() => navigate(isCombo ? `/tienda` : `/producto/${idStr}`)}
                                                            className="flex-1 sm:flex-none border-2 border-slate-800 text-slate-800 font-bold py-1.5 px-4 rounded text-xs hover:bg-slate-800 hover:text-white transition shadow-sm bg-white"
                                                        >
                                                            Ver producto
                                                        </button>
                                                        {!isCombo && pedido.estado === 'PAGADO' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPurchase({
                                                                        producto: itemComprado,
                                                                        idPedido: pedido.idPedido
                                                                    });
                                                                    setIsModalOpen(true);
                                                                }}
                                                                disabled={pedido.envio?.estado !== 'Entregado'}
                                                                className={`flex-1 sm:flex-none font-bold py-1.5 px-4 rounded text-xs transition shadow-sm flex items-center justify-center gap-1.5 ${pedido.envio?.estado === 'Entregado'
                                                                        ? 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer'
                                                                        : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                                                                    }`}
                                                                title={pedido.envio?.estado !== 'Entregado' ? 'Podrás opinar cuando tu pedido sea entregado' : ''}
                                                            >
                                                                <MessageSquare size={14} />
                                                                Opinar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pie del pedido: Botón de Seguir Envío (sólo si está PAGADO) */}
                                    {pedido.estado === 'PAGADO' && (
                                        <div className="flex justify-end border-t border-slate-100 pt-4">
                                            <button
                                                onClick={() => {
                                                    setTrackingPedido(pedido);
                                                    setIsTrackingOpen(true);
                                                }}
                                                className="flex items-center justify-center gap-2 bg-brand-yellow text-slate-900 font-bold py-2 px-6 rounded-lg text-sm hover:bg-yellow-400 transition shadow-sm"
                                            >
                                                <Truck size={16} />
                                                Seguir envío
                                            </button>
                                        </div>
                                    )}
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

            <CheckoutSuccessModal
                isOpen={isCheckoutSuccessOpen}
                onClose={() => {
                    setIsCheckoutSuccessOpen(false);
                    if (levelUpInfo && levelUpInfo.show) {
                        setIsLevelUpOpen(true);
                    }
                }}
                pedido={checkoutSuccessPedido}
                paymentId={checkoutSuccessPaymentId}
            />

            <CheckoutFailureModal
                isOpen={isCheckoutFailureOpen}
                onClose={() => setIsCheckoutFailureOpen(false)}
            />

            <LevelUpModal
                isOpen={isLevelUpOpen}
                onClose={() => {
                    setIsLevelUpOpen(false);
                    setLevelUpInfo(null);
                }}
                prevLevel={levelUpInfo?.prevLevel}
                newLevel={levelUpInfo?.newLevel}
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
