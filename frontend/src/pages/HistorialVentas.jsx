import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistorialVentasAdminRequest } from '../api/pedidos';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminReviewModal from '../components/AdminReviewModal';
import { Calendar, Hash, User, ChevronDown, Search } from 'lucide-react';

const HistorialVentas = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' o 'asc'
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(5); // Para el botón Ver más
    const [modalData, setModalData] = useState({ isOpen: false, idUsuario: null, idProducto: null, idPedido: null, productoNombre: '' });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const data = await getHistorialVentasAdminRequest();

                // Extraer todas las lineas de todos los pedidos
                let allItems = [];
                data.forEach(pedido => {
                    if (pedido.lineas) {
                        // Calculamos el subtotal real (sin descuentos) de todo el pedido
                        const subtotalPedido = pedido.lineas.reduce((acc, l) => acc + (Number(l.precioHistorico) * Number(l.cantidad)), 0);
                        
                        // Factor de descuento (ej: 0.9 si hubo 10% de descuento)
                        // Si el subtotal es 0, el factor es 1
                        const discountFactor = subtotalPedido > 0 ? (Number(pedido.total) / subtotalPedido) : 1;

                        pedido.lineas.forEach(linea => {
                            // Calculamos el total de esta linea aplicado el descuento proporcional del pedido
                            const totalConDescuentoProporcional = (Number(linea.precioHistorico) * Number(linea.cantidad)) * discountFactor;

                            allItems.push({
                                ...linea,
                                totalRealLinea: totalConDescuentoProporcional, // Guardamos el total ya descontado
                                fechaPedido: pedido.fecha,
                                idPedido: pedido.idPedido,
                                estado: pedido.estado, // Guardamos el estado (PENDIENTE, PAGADO, etc)
                                usuario: pedido.usuario
                            });
                        });
                    }
                });

                setVentas(allItems);
            } catch (error) {
                console.error("Error al traer historial de ventas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVentas();
    }, []);

    // Filtro por búsqueda (nombre de producto o código)
    const ventasFiltradas = ventas.filter(item => {
        const itemComprado = item.producto || item.combo;
        if (!itemComprado) return false;
        
        const term = searchTerm.toLowerCase();
        const matchesName = itemComprado.titulo && itemComprado.titulo.toLowerCase().includes(term);
        const matchesCode = (itemComprado.codigoCombo || itemComprado.codigoProducto || itemComprado.idProducto || itemComprado.idCombo || '').toString().toLowerCase().includes(term);
        
        return matchesName || matchesCode;
    });

    // Ordenamiento por fecha
    const ventasOrdenadas = [...ventasFiltradas].sort((a, b) => {
        const dateA = new Date(a.fechaPedido).getTime();
        const dateB = new Date(b.fechaPedido).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // Elementos a mostrar limitados por el botón Ver más
    const ventasPaginadas = ventasOrdenadas.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 5);
    };

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
                    alt="Banner Historial de ventas"
                />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-bold mb-2">Historial de ventas</h2>
                    <p className="text-sm font-medium opacity-80">Inicio {'>'} Historial de ventas</p>
                </div>
            </section>

            <div className="bg-brand-yellow w-full py-4 px-10 shadow-sm border-b border-yellow-500">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Select de orden */}
                    <div className="relative w-48 shrink-0">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-white appearance-none w-full pr-10 pl-4 py-2 rounded text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200 transition outline-none focus:border-brand-red cursor-pointer"
                        >
                            <option value="desc">Descendente</option>
                            <option value="asc">Ascendente</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <div className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-500 font-bold uppercase pointer-events-none">Orden por fecha</div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="relative w-full sm:w-96">
                        <input
                            type="text"
                            placeholder="Buscar por producto (con código)"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setVisibleCount(5); // Reset al buscar
                            }}
                            className="w-full pl-4 pr-10 py-2 rounded-full text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-red shadow-sm border border-slate-200 transition"
                        />
                        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Resultados */}
                    <div className="text-sm font-bold text-slate-800 shrink-0">
                        Resultados: {ventasFiltradas.length}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-4xl mx-auto w-full py-12 px-6">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-40 bg-slate-200 rounded-lg w-full"></div>
                        <div className="h-40 bg-slate-200 rounded-lg w-full"></div>
                    </div>
                ) : ventasFiltradas.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl font-bold text-slate-400">No se encontraron ventas con esos criterios.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {ventasPaginadas.map((item, index) => {
                            const itemComprado = item.producto || item.combo;
                            const isCombo = !!item.combo;
                            const imagen = isCombo 
                                ? 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop'
                                : (itemComprado?.imagen || itemComprado?.imagenes || itemComprado?.image || 'https://placehold.co/300x300/f1f5f9/64748b?text=Lego+Producto');
                            
                            const idStr = isCombo ? `combo-${itemComprado?.idCombo}` : itemComprado?.idProducto;
                            const codigo = itemComprado?.codigoCombo || itemComprado?.codigoProducto || idStr;

                            const usuario = item.usuario;
                            const totalVenta = item.totalRealLinea;

                            return (
                                <div key={index} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
                                    <div className="h-28 w-28 bg-slate-100 rounded-md overflow-hidden shrink-0 flex items-center justify-center p-2">
                                        <img src={imagen} alt={itemComprado?.titulo} className="object-contain w-full h-full mix-blend-multiply" />
                                    </div>

                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex justify-between items-start w-full">
                                            <h3 className="font-bold text-lg text-slate-800">
                                                {itemComprado?.titulo} <span className="text-slate-500 text-sm font-medium">x{item.cantidad}</span>
                                            </h3>
                                            
                                            {/* Box de Total a la derecha */}
                                            <div className="flex border border-slate-200 rounded overflow-hidden shadow-sm shadow-slate-100 bg-white">
                                                <div className="bg-slate-50 px-3 py-1 text-sm font-bold border-r border-slate-200 text-slate-700">
                                                    Total
                                                </div>
                                                <div className="px-3 py-1 text-sm font-bold text-slate-800 min-w-[100px] text-right">
                                                    {totalVenta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-slate-600">
                                            <div className="flex flex-col gap-1 items-center">
                                                <Hash size={20} className="text-slate-800" strokeWidth={2.5} />
                                                <span className="text-xs">Codigo: {codigo}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 items-center">
                                                <Calendar size={20} className="text-slate-800" strokeWidth={2} />
                                                <span className="text-xs">Fecha: {formatDate(item.fechaPedido)}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 items-center">
                                                <User size={20} className="text-slate-800" strokeWidth={2} />
                                                <span className="text-xs">ID usuario: {usuario?.idUsuario}</span>
                                            </div>

                                            {/* Badge de Estado */}
                                            <div className="flex flex-col gap-1 items-center">
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    item.estado === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                                    item.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {item.estado}
                                                </div>
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Estado</span>
                                            </div>

                                            {/* Botón ver reseña alineado al final */}
                                            <div className="ml-auto mt-2 sm:mt-0">
                                                {!isCombo && item.estado === 'PAGADO' && (
                                                    <button 
                                                        onClick={() => setModalData({
                                                            isOpen: true,
                                                            idUsuario: usuario?.idUsuario,
                                                            idProducto: itemComprado?.idProducto,
                                                            idPedido: item.idPedido,
                                                            productoNombre: itemComprado?.titulo
                                                        })}
                                                        className="border border-slate-300 text-slate-600 font-bold py-1.5 px-4 rounded text-xs hover:bg-slate-50 transition shadow-sm"
                                                    >
                                                        Ver reseña
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {ventasOrdenadas.length > visibleCount && (
                            <div className="flex justify-center mt-8">
                                <button 
                                    onClick={handleLoadMore}
                                    className="bg-white border border-slate-300 text-slate-700 px-8 py-2 font-bold rounded text-sm hover:bg-slate-50 transition"
                                >
                                    Ver mas
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />

            <AdminReviewModal 
                isOpen={modalData.isOpen}
                onClose={() => setModalData({ ...modalData, isOpen: false })}
                idUsuario={modalData.idUsuario}
                idProducto={modalData.idProducto}
                idPedido={modalData.idPedido}
                productoNombre={modalData.productoNombre}
            />
        </div>
    );
};

export default HistorialVentas;
