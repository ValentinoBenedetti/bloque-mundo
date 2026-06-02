import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getHistorialVentasAdminRequest } from '../api/pedidos';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminReviewModal from '../components/AdminReviewModal';
import { Calendar, Hash, User, ChevronDown, Search, X, FileSpreadsheet, Filter, FileText, Package } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const HistorialVentas = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' o 'asc'
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('Todos');
    const [filtroMonto, setFiltroMonto] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5); // Para el botón Ver más
    const [modalData, setModalData] = useState({ isOpen: false, idUsuario: null, idProducto: null, idPedido: null, productoNombre: '' });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const data = await getHistorialVentasAdminRequest();
                setVentas(data);
            } catch (error) {
                console.error("Error al traer historial de ventas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVentas();
    }, []);

    // Filtro por búsqueda (nombre de producto, código, idPedido o nombre de usuario)
    const ventasFiltradas = ventas.filter(pedido => {
        if (estadoFiltro !== 'Todos' && pedido.estado !== estadoFiltro) return false;
        if (filtroMonto && Number(pedido.total) <= 100000) return false;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesId = String(pedido.idPedido).includes(term);
            const matchesUser = pedido.usuario ? 
                `${pedido.usuario.nombre || ''} ${pedido.usuario.apellido || ''}`.toLowerCase().includes(term) : false;
            
            const matchesLineas = pedido.lineas?.some(linea => {
                const itemComprado = linea.producto || linea.combo;
                if (!itemComprado) return false;
                const matchesName = itemComprado.titulo && itemComprado.titulo.toLowerCase().includes(term);
                const matchesCode = (itemComprado.codigoCombo || itemComprado.codigoProducto || itemComprado.idProducto || itemComprado.idCombo || '').toString().toLowerCase().includes(term);
                return matchesName || matchesCode;
            });
            
            return matchesId || matchesUser || matchesLineas;
        }
        return true;
    });

    // Ordenamiento por fecha
    const ventasOrdenadas = [...ventasFiltradas].sort((a, b) => {
        const dateA = new Date(a.fecha).getTime();
        const dateB = new Date(b.fecha).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const hasActiveFilters = searchTerm !== '' || estadoFiltro !== 'Todos' || sortOrder !== 'desc' || filtroMonto;
    const clearFilters = () => {
        setSearchTerm('');
        setEstadoFiltro('Todos');
        setFiltroMonto(false);
        setSortOrder('desc');
        setVisibleCount(5);
    };

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

    const handleExportExcel = () => {
        const dataToExport = ventasFiltradas.map(pedido => ({
            'ID Pedido': pedido.idPedido,
            'Fecha': formatDate(pedido.fecha),
            'Estado': pedido.estado,
            'Total': Number(pedido.total),
            'ID Usuario': pedido.usuario?.idUsuario || 'N/A',
            'Nombre Usuario': `${pedido.usuario?.nombre || ''} ${pedido.usuario?.apellido || ''}`.trim(),
            'Email': pedido.usuario?.email || pedido.usuario?.correo || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
        XLSX.writeFile(workbook, "Reporte_Ventas.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Ventas - Bloque Mundo", 14, 15);
        
        const tableColumn = ["ID Pedido", "Fecha", "Estado", "Total", "Cliente"];
        const tableRows = [];

        ventasFiltradas.forEach(pedido => {
            const pedidoData = [
                pedido.idPedido,
                formatDate(pedido.fecha),
                pedido.estado,
                `$${Number(pedido.total).toLocaleString('es-AR')}`,
                `${pedido.usuario?.nombre || ''} ${pedido.usuario?.apellido || ''}`.trim() || 'N/A'
            ];
            tableRows.push(pedidoData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'striped',
            headStyles: { fillColor: [214, 40, 40] } // Brand Red
        });

        doc.save("Reporte_Ventas.pdf");
    };

    // Datos para el gráfico de barras (Ventas por Estado)
    const statsData = [
        { name: 'Pagados', cantidad: ventas.filter(v => v.estado === 'PAGADO').length },
        { name: 'Pendientes', cantidad: ventas.filter(v => v.estado === 'PENDIENTE').length },
        { name: 'Cancelados', cantidad: ventas.filter(v => v.estado === 'CANCELADO').length }
    ];

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
                    <h1 className="text-4xl font-black uppercase italic tracking-tight drop-shadow-lg">
                        Historial de ventas
                    </h1>
                    <p className="text-sm font-medium text-slate-300 mt-2">
                        <Link to="/" className="hover:text-brand-yellow transition-colors">Inicio</Link>{' '}
                        <span className="text-slate-400 mx-1">›</span>
                        <Link to="/historial-ventas" className="hover:text-brand-yellow transition-colors">Historial de ventas</Link>
                    </p>
                </div>
            </section>

            <div className="bg-slate-900 w-full py-5 px-4 sm:px-10 shadow-xl border-t-4 border-t-brand-yellow border-b border-b-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row flex-wrap justify-between items-center gap-6">
                    <div className="flex gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-center sm:justify-start">
                        <button
                            onClick={clearFilters}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border transition duration-200 shadow-sm shrink-0 ${
                                hasActiveFilters 
                                ? 'bg-brand-yellow text-slate-900 border-brand-yellow hover:bg-yellow-500' 
                                : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-brand-yellow hover:text-slate-900 hover:border-brand-yellow'
                            }`}
                        >
                            <X size={16} /> Limpiar Filtros
                        </button>
                        {/* Select de orden */}
                        <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-56 group">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${sortOrder !== "desc" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="desc" className="bg-slate-900 text-slate-100">Orden por fecha: Más nuevo</option>
                                <option value="asc" className="bg-slate-900 text-slate-100">Orden por fecha: Más antiguo</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${sortOrder !== "desc" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>

                        {/* Select de estado */}
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
                        
                        {/* Botón Filtro Monto > 100k */}
                        <button
                            onClick={() => {
                                setFiltroMonto(!filtroMonto);
                                setVisibleCount(5);
                            }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border transition duration-200 shadow-sm shrink-0 ${
                                filtroMonto 
                                ? 'bg-brand-yellow text-slate-900 border-brand-yellow hover:bg-yellow-500' 
                                : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-brand-yellow hover:text-slate-900 hover:border-brand-yellow'
                            }`}
                        >
                            <Filter size={16} /> &gt; $100.000
                        </button>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="relative flex-1 min-w-[250px] max-w-md group">
                        <input
                            type="text"
                            placeholder="Buscar por ID, Usuario o Producto..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setVisibleCount(5); // Reset al buscar
                            }}
                            className={`w-full pl-6 pr-12 py-2.5 rounded-full text-sm font-semibold bg-slate-800 border ${searchTerm ? 'border-brand-yellow text-brand-yellow focus:ring-brand-yellow' : 'border-slate-700 text-slate-100 placeholder:text-slate-400 hover:border-brand-yellow focus:ring-brand-yellow'} outline-none focus:ring-2 transition`}
                        />
                        <Search size={16} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${searchTerm ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                    </div>

                    {/* Resultados */}
                    <div className="flex items-center gap-4 shrink-0 flex-wrap">
                        <div className="text-sm font-semibold text-slate-400">
                            Mostrando <span className="text-brand-yellow font-black text-base">{Math.min(visibleCount, ventasFiltradas.length)}</span> de <span className="text-brand-yellow font-black text-base">{ventasFiltradas.length}</span> {ventasFiltradas.length === 1 ? 'resultado' : 'resultados'}
                        </div>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-sm text-sm"
                        >
                            <FileText size={16} /> Exportar PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-sm text-sm"
                        >
                            <FileSpreadsheet size={16} /> Exportar Excel
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6">
                
                {/* --- DASHBOARD --- */}
                {!loading && ventas.length > 0 && (
                    <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter mb-6">Métricas de Ventas</h2>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip 
                                        cursor={{fill: '#f1f5f9'}} 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="cantidad" fill="#D62828" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                {/* ----------------- */}

                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-40 bg-slate-200 rounded-lg w-full"></div>
                        <div className="h-40 bg-slate-200 rounded-lg w-full"></div>
                    </div>
                ) : ventas.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl font-bold text-slate-400">Aún no hay ventas registradas.</p>
                    </div>
                ) : ventasFiltradas.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-2xl font-bold text-slate-400">No se encontraron pedidos con esos criterios.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {ventasPaginadas.map((pedido) => {
                            const usuario = pedido.usuario || {};

                            return (
                                <div key={pedido.idPedido} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-6">
                                    {/* Info General del Pedido */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-4">
                                        {/* Info Pedido */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-slate-800">
                                                <Hash size={20} className="text-brand-red animate-pulse" />
                                                <h3 className="font-bold text-lg leading-none">Pedido #{pedido.idPedido}</h3>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1.5">
                                                Fecha: {formatDate(pedido.fecha)}
                                            </p>
                                            <p className="text-sm font-black text-slate-800 mt-2">
                                                Total Venta: ${(Number(pedido.total) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        {/* Info Usuario */}
                                        <div className="space-y-2 border-l border-slate-100 pl-4">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <User size={16} />
                                                <span className="font-bold text-sm">
                                                    {usuario.nombre || 'Usuario'} {usuario.apellido || ''}
                                                </span>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500">ID Usuario: {usuario.idUsuario || 'N/A'}</p>
                                            <p className="text-xs font-medium text-slate-500">{usuario.email || usuario.correo}</p>
                                        </div>

                                        {/* Estados */}
                                        <div className="border-l border-slate-100 pl-4 flex gap-6">
                                            <div className="space-y-2 flex flex-col justify-start">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                                                    Estado del Pedido
                                                </div>
                                                <div className="mt-1.5">
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide inline-block ${
                                                        pedido.estado === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                                        pedido.estado === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                                                        pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {pedido.estado}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 flex flex-col justify-start">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                                                    Estado del Envío
                                                </div>
                                                <div className="mt-1.5">
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide inline-block ${
                                                        pedido.envio?.estado === 'Entregado' ? 'bg-blue-100 text-blue-700' :
                                                        pedido.envio?.estado === 'En camino' ? 'bg-indigo-100 text-indigo-700' :
                                                        pedido.envio?.estado === 'Preparando' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {pedido.envio?.estado || 'PENDIENTE'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Productos del pedido */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Productos Vendidos</h4>
                                        {pedido.lineas?.map((linea, idx) => {
                                            const itemComprado = linea.producto || linea.combo;
                                            const isCombo = !!linea.combo;
                                            const imagen = isCombo 
                                                ? (itemComprado?.imagen || (Array.isArray(itemComprado?.imagenes) ? itemComprado.imagenes[0] : itemComprado?.imagenes) || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=600&auto=format&fit=crop')
                                                : (itemComprado?.imagen || (Array.isArray(itemComprado?.imagenes) ? itemComprado.imagenes[0] : itemComprado?.imagenes) || itemComprado?.image || 'https://placehold.co/300x300/f1f5f9/64748b?text=Lego+Producto');

                                            const idStr = isCombo ? `combo-${itemComprado?.idCombo}` : itemComprado?.idProducto;
                                            const codigo = itemComprado?.codigoCombo || itemComprado?.codigoProducto || idStr;

                                            return (
                                                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 transition">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-16 w-16 bg-white border border-slate-200 rounded overflow-hidden shrink-0 flex items-center justify-center p-1">
                                                            <img src={imagen} alt={itemComprado?.titulo} className="object-contain w-full h-full mix-blend-multiply" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-sm text-slate-800">
                                                                {itemComprado?.titulo}
                                                            </h5>
                                                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                                                Cantidad: <span className="font-bold text-slate-700">{linea.cantidad}</span> • Código: {codigo}
                                                            </p>
                                                            <p className="text-xs font-bold text-slate-600 mt-1">
                                                                Precio Unitario: ${(Number(linea.precioHistorico)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Acciones individuales (Ver Reseña) */}
                                                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                                                        {!isCombo && pedido.estado === 'PAGADO' && (
                                                            <button
                                                                onClick={() => setModalData({
                                                                    isOpen: true,
                                                                    idUsuario: usuario?.idUsuario,
                                                                    idProducto: itemComprado?.idProducto,
                                                                    idPedido: pedido.idPedido,
                                                                    productoNombre: itemComprado?.titulo
                                                                })}
                                                                className="border-2 border-slate-850 text-slate-800 font-bold py-1.5 px-4 rounded text-xs hover:bg-slate-800 hover:text-white transition shadow-sm bg-white"
                                                            >
                                                                Ver reseña
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {ventasOrdenadas.length > visibleCount && (
                            <div className="flex justify-center mt-8">
                                <button 
                                    onClick={handleLoadMore}
                                    className="bg-white border-2 border-brand-red text-brand-red px-8 py-2.5 font-bold rounded-full hover:bg-brand-red hover:text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer text-sm"
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
