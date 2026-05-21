import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEnviosRequest, updateEnvioEstadoRequest } from '../api/envios';
import { confirmarPagoAdminRequest } from '../api/pedidos';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Package, MapPin, DollarSign, User, Search, ChevronDown, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const GestionEnvios = () => {
    const [envios, setEnvios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [estadoEnvioFiltro, setEstadoEnvioFiltro] = useState('Todos');
    const [updatingId, setUpdatingId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        setVisibleCount(5);
    }, [searchTerm, sortOrder, estadoEnvioFiltro]);

    useEffect(() => {
        const fetchEnvios = async () => {
            try {
                const data = await getEnviosRequest();
                setEnvios(data);
            } catch (error) {
                console.error("Error fetching envios:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnvios();
    }, []);

    const handleEstadoChange = async (idEnvio, nuevoEstado) => {
        try {
            setUpdatingId(idEnvio);
            await updateEnvioEstadoRequest(idEnvio, nuevoEstado);

            // Actualizar estado local
            setEnvios(prev => prev.map(envio =>
                envio.idEnvio === idEnvio ? { ...envio, estado: nuevoEstado } : envio
            ));

            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `El pedido pasó a estado: ${nuevoEstado}`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const enviosFiltrados = envios.filter(envio => {
        const pedido = envio.pedido || {};
        // Solo mostrar pedidos que ya estén PAGADOS
        if (pedido.estado !== 'PAGADO') return false;

        if (estadoEnvioFiltro !== 'Todos' && envio.estado !== estadoEnvioFiltro) return false;

        const term = searchTerm.toLowerCase();
        const idPedido = pedido.idPedido?.toString().toLowerCase() || '';
        const idEnvio = envio.idEnvio?.toString().toLowerCase() || '';
        const correo = pedido.usuario?.email?.toLowerCase() || pedido.usuario?.correo?.toLowerCase() || '';
        const nombre = pedido.usuario?.nombre?.toLowerCase() || '';

        return idPedido.includes(term) || idEnvio.includes(term) || correo.includes(term) || nombre.includes(term);
    });

    const enviosOrdenados = [...enviosFiltrados].sort((a, b) => {
        const dateA = new Date(a.pedido?.fecha || 0).getTime();
        const dateB = new Date(b.pedido?.fecha || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'En camino': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Entregado': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <section className="relative h-64 bg-slate-900 flex flex-col items-center justify-center text-white">
                <img
                    src="/assets/banners/envios.png"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                    alt="Banner Gestión de Pedidos"
                />
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl font-black uppercase italic tracking-tight drop-shadow-lg">
                        Gestión de Envíos
                    </h1>
                    <p className="text-sm font-medium text-slate-300 mt-2">
                        <Link to="/" className="hover:text-brand-yellow transition-colors">Inicio</Link>{' '}
                        <span className="text-slate-400 mx-1">›</span>
                        <Link to="/admin/pedidos" className="hover:text-brand-yellow transition-colors">Gestión de envíos</Link>
                    </p>
                </div>
            </section>

            <div className="bg-slate-900 w-full py-5 px-4 sm:px-10 shadow-xl border-t-4 border-t-brand-yellow border-b border-b-slate-800">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap gap-4 w-full sm:w-auto justify-center sm:justify-start">
                        <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-56 group">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${sortOrder !== "desc" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="desc" className="bg-slate-900 text-slate-100">Orden por fecha: Más recientes</option>
                                <option value="asc" className="bg-slate-900 text-slate-100">Orden por fecha: Más antiguos</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${sortOrder !== "desc" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>

                        <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-56 group">
                            <select
                                value={estadoEnvioFiltro}
                                onChange={(e) => setEstadoEnvioFiltro(e.target.value)}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${estadoEnvioFiltro !== "Todos" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="Todos" className="bg-slate-900 text-slate-100">Estado de envío: Todos</option>
                                <option value="Pendiente" className="bg-slate-900 text-slate-100">Estado de envío: Pendientes</option>
                                <option value="En camino" className="bg-slate-900 text-slate-100">Estado de envío: En camino</option>
                                <option value="Entregado" className="bg-slate-900 text-slate-100">Estado de envío: Entregados</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${estadoEnvioFiltro !== "Todos" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                        </div>
                    </div>

                    <div className="relative w-full sm:w-96 group">
                        <input
                            type="text"
                            placeholder="Buscar por ID Pedido, ID Envío o Nombre"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-6 pr-12 py-2.5 rounded-full text-sm font-semibold bg-slate-800 border ${searchTerm ? 'border-brand-yellow text-brand-yellow focus:ring-brand-yellow' : 'border-slate-700 text-slate-100 placeholder:text-slate-400 hover:border-brand-yellow focus:ring-brand-yellow'} outline-none focus:ring-2 transition`}
                        />
                        <Search size={16} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${searchTerm ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`} />
                    </div>

                    <div className="text-sm font-semibold text-slate-400 shrink-0">
                        Mostrando <span className="text-brand-yellow font-black text-base">{Math.min(visibleCount, enviosFiltrados.length)}</span> de <span className="text-brand-yellow font-black text-base">{enviosFiltrados.length}</span> {enviosFiltrados.length === 1 ? 'resultado' : 'resultados'}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-32 bg-slate-200 rounded-lg w-full"></div>
                        <div className="h-32 bg-slate-200 rounded-lg w-full"></div>
                    </div>
                ) : enviosFiltrados.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-2xl font-bold text-slate-400">No se encontraron pedidos con esos criterios.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {enviosOrdenados.slice(0, visibleCount).map((envio) => {
                            const pedido = envio.pedido || {};
                            const usuario = pedido.usuario || {};

                            return (
                                <div key={envio.idEnvio} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">

                                    <div className="flex-1 flex flex-col gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Info Pedido */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-slate-800">
                                                    <Package size={20} className="text-brand-red" />
                                                    <h3 className="font-bold text-lg leading-none">Pedido #{pedido.idPedido}</h3>
                                                </div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                    ID Envío: {envio.idEnvio} • Fecha: {formatDate(pedido.fecha)}
                                                </p>
                                                <p className="text-sm font-bold text-slate-800 mt-2">
                                                    Total Pedido: ${(Number(pedido.total) || 0).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Info Usuario */}
                                            <div className="space-y-2 border-l border-slate-100 pl-4">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <User size={16} />
                                                    <span className="font-bold text-sm">
                                                        {usuario.nombre || 'Usuario'} {usuario.apellido || ''} <span className="text-slate-400 font-medium">(ID: {usuario.idUsuario || 'N/A'})</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500">{usuario.email || usuario.correo}</p>
                                            </div>

                                            {/* Info Envío & Costo */}
                                            <div className="space-y-2 border-l border-slate-100 pl-4">
                                                <div className="flex items-start gap-2 text-slate-700">
                                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                                    <span className="font-bold text-sm leading-tight">
                                                        {usuario.direccion || 'Dirección no registrada'} <br />
                                                        <span className="text-xs font-medium text-slate-500">CP: {envio.codigoPostal}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-700 mt-2">
                                                    <DollarSign size={16} />
                                                    <span className="font-bold text-sm">Costo Envío: ${(Number(envio.costo) || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Productos del pedido */}
                                        {pedido.lineas && pedido.lineas.length > 0 && (
                                            <div className="mt-2 bg-slate-50 rounded-lg p-4 border border-slate-100">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Productos del Pedido</h4>
                                                <ul className="space-y-2">
                                                    {pedido.lineas.map((linea, idx) => {
                                                        const item = linea.producto || linea.combo || {};
                                                        return (
                                                            <li key={idx} className="flex justify-between items-center text-sm">
                                                                <span className="font-medium text-slate-700">
                                                                    <span className="font-bold text-slate-900">{linea.cantidad}x</span> {item.titulo || 'Producto Desconocido'}
                                                                </span>
                                                                <span className="font-bold text-slate-800">
                                                                    ${(Number(linea.precioHistorico) * Number(linea.cantidad)).toLocaleString()}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 shrink-0 flex flex-col gap-3">
                                        {/* Botón de confirmar pago si está PENDIENTE */}
                                        {pedido.estado === 'PENDIENTE' && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await confirmarPagoAdminRequest(pedido.idPedido);
                                                        // Recargar la lista para ver el cambio
                                                        const data = await getEnviosRequest();
                                                        setEnvios(data);
                                                        Swal.fire('¡Éxito!', 'Pago confirmado manualmente', 'success');
                                                    } catch (error) {
                                                        Swal.fire('Error', 'No se pudo confirmar el pago', 'error');
                                                    }
                                                }}
                                                className="bg-green-600 text-white font-bold py-2 px-4 rounded text-xs hover:bg-green-700 transition shadow-sm mb-2"
                                            >
                                                Confirmar Pago
                                            </button>
                                        )}

                                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Estado Envío</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getEstadoColor(envio.estado)}`}>
                                                {envio.estado}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                value={envio.estado}
                                                onChange={(e) => handleEstadoChange(envio.idEnvio, e.target.value)}
                                                disabled={updatingId === envio.idEnvio}
                                                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded px-3 py-2 outline-none focus:border-brand-red disabled:opacity-50"
                                            >
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="En camino">En camino</option>
                                                <option value="Entregado">Entregado</option>
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}

                        {enviosOrdenados.length > visibleCount && (
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
        </div>
    );
};

export default GestionEnvios;
