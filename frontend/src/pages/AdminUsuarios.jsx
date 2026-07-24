import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronDown, Search, Mail, ShoppingBag, Users, X } from 'lucide-react';
import { getAllUsuariosRequest } from '../api/usuarios';

// ─── Modal Ver Compras ───────────────────────────────────────────────────────
const VerComprasModal = ({ usuario, pedidos, onClose }) => {
    if (!usuario) return null;

    const pedidosDelUsuario = pedidos.filter(
        (p) => p.usuario?.idUsuario === usuario.idUsuario
    );

    const formatPrice = (n) =>
        new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0,
        }).format(n || 0);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-5 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-wide">
                            Compras de {usuario.apellido} {usuario.nombre}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {usuario.idUsuario}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition text-white"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-slate-50">
                    {pedidosDelUsuario.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <ShoppingBag size={40} className="text-slate-200 mb-3" />
                            <p className="text-slate-400 font-bold">Este usuario no tiene compras registradas.</p>
                        </div>
                    ) : (
                        pedidosDelUsuario.map((pedido) => (
                            <div
                                key={pedido.idPedido}
                                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            Pedido #{pedido.idPedido}
                                        </span>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {formatDate(pedido.fecha)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${pedido.estado === 'PAGADO'
                                                ? 'bg-green-100 text-green-700'
                                                : pedido.estado === 'CANCELADO'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {pedido.estado}
                                        </span>
                                        <span className="font-black text-slate-800 text-sm">
                                            {formatPrice(pedido.total)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {pedido.lineas?.map((linea, i) => {
                                        const item = linea.producto || linea.combo;
                                        return (
                                            <div
                                                key={i}
                                                className="flex justify-between text-xs text-slate-600 border-t border-slate-100 pt-2"
                                            >
                                                <span className="font-medium">
                                                    {item?.titulo} <span className="text-slate-400">x{linea.cantidad}</span>
                                                </span>
                                                <span className="font-bold">
                                                    {formatPrice(
                                                        Number(linea.precioHistorico || linea.precioUnitario) *
                                                        linea.cantidad
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Página Principal ────────────────────────────────────────────────────────
const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [pedidosTodos, setPedidosTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc'); // desc = más nuevos primero
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);
    const [modalUsuario, setModalUsuario] = useState(null);
    const [loadingPedidos, setLoadingPedidos] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllUsuariosRequest();
                setUsuarios(data);
            } catch (err) {
                console.error('Error al traer usuarios:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleVerCompras = async (usuario) => {
        setModalUsuario(usuario);
        if (pedidosTodos.length === 0) {
            setLoadingPedidos(true);
            try {
                const savedUser = localStorage.getItem('usuarioBloqueMundo');
                const token = savedUser ? JSON.parse(savedUser) : null;
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pedidos/admin', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setPedidosTodos(data);
            } catch (err) {
                console.error('Error al traer pedidos:', err);
            } finally {
                setLoadingPedidos(false);
            }
        }
    };

    const handleEnviarCorreo = (email) => {
        // Abre Gmail directamente en una nueva pestaña listo para redactar
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
    };

    // Filtro + orden
    const usuariosFiltrados = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        let filtrados = usuarios;

        if (term) {
            filtrados = usuarios.filter(
                (u) =>
                    u.idUsuario?.toLowerCase().includes(term) ||
                    u.nombre?.toLowerCase().includes(term) ||
                    u.apellido?.toLowerCase().includes(term) ||
                    u.email?.toLowerCase().includes(term)
            );
        }

        return [...filtrados].sort((a, b) => {
            const da = new Date(a.fechaRegistro).getTime();
            const db = new Date(b.fechaRegistro).getTime();
            return sortOrder === 'desc' ? db - da : da - db;
        });
    }, [usuarios, searchTerm, sortOrder]);

    const usuariosPaginados = usuariosFiltrados.slice(0, visibleCount);

    const hasActiveFilters = searchTerm !== '' || sortOrder !== 'desc';
    const clearFilters = () => {
        setSearchTerm('');
        setSortOrder('desc');
        setVisibleCount(6);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="relative h-56 bg-slate-900 flex flex-col items-center justify-center text-white overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1543622748-5ee7237e8565?q=80&w=2070&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    alt="Banner administrar usuarios"
                />
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl font-black uppercase italic tracking-tight drop-shadow-lg">
                        Administrar usuarios
                    </h1>
                    <p className="text-sm font-medium text-slate-300 mt-2">
                        <Link to="/" className="hover:text-brand-yellow transition-colors">Inicio</Link>{' '}
                        <span className="text-slate-400 mx-1">›</span>
                        <Link to="/admin-usuarios" className="hover:text-brand-yellow transition-colors">Administrar usuarios</Link>
                    </p>
                </div>
            </section>

            {/* ── Barra de filtros ──────────────────────────────── */}
            <div className="bg-slate-900 w-full py-5 px-4 sm:px-10 shadow-xl border-t-4 border-t-brand-yellow border-b border-b-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap gap-4 w-full sm:w-auto justify-center sm:justify-start">
                        <button
                            onClick={clearFilters}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border transition duration-200 shadow-sm shrink-0 ${hasActiveFilters
                                ? 'bg-brand-yellow text-slate-900 border-brand-yellow hover:bg-yellow-500'
                                : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-brand-yellow hover:text-slate-900 hover:border-brand-yellow'
                                }`}
                        >
                            <X size={16} /> Limpiar Filtros
                        </button>
                        {/* Selector orden */}
                        <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-64 group">
                            <select
                                value={sortOrder}
                                onChange={(e) => {
                                    setSortOrder(e.target.value);
                                    setVisibleCount(6);
                                }}
                                className={`bg-slate-800 hover:bg-slate-700 appearance-none w-full pr-10 pl-4 py-2 rounded-full text-sm font-semibold border ${sortOrder !== "desc" ? 'border-brand-yellow text-brand-yellow' : 'border-slate-700 text-slate-200 hover:border-brand-yellow'} shadow-sm transition duration-200 outline-none cursor-pointer`}
                            >
                                <option value="desc" className="bg-slate-900 text-slate-100">Fecha de registro: Más nuevo</option>
                                <option value="asc" className="bg-slate-900 text-slate-100">Fecha de registro: Más antiguo</option>
                            </select>
                            <ChevronDown
                                size={14}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${sortOrder !== "desc" ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`}
                            />
                        </div>
                    </div>

                    {/* Búsqueda */}
                    <div className="relative w-full sm:w-80 group">
                        <input
                            type="text"
                            placeholder="Buscar usuarios..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setVisibleCount(6);
                            }}
                            className={`w-full pl-6 pr-12 py-2.5 rounded-full text-sm font-semibold bg-slate-800 border ${searchTerm ? 'border-brand-yellow text-brand-yellow focus:ring-brand-yellow' : 'border-slate-700 text-slate-100 placeholder:text-slate-400 hover:border-brand-yellow focus:ring-brand-yellow'} outline-none focus:ring-2 transition`}
                        />
                        <Search
                            size={16}
                            className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${searchTerm ? 'text-brand-yellow' : 'text-slate-400 group-hover:text-brand-yellow'}`}
                        />
                    </div>

                    {/* Resultados */}
                    <div className="text-sm font-semibold text-slate-400 shrink-0">
                        Mostrando <span className="text-brand-yellow font-black text-base">{Math.min(visibleCount, usuariosFiltrados.length)}</span> de <span className="text-brand-yellow font-black text-base">{usuariosFiltrados.length}</span> {usuariosFiltrados.length === 1 ? 'resultado' : 'resultados'}
                    </div>
                </div>
            </div>

            {/* ── Lista de usuarios ────────────────────────────── */}
            <main className="flex-1 max-w-5xl mx-auto w-full py-10 px-6">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-slate-200 rounded-xl w-full" />
                        ))}
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="text-center py-20">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-2xl font-bold text-slate-400">
                            No se encontraron usuarios con esos criterios.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {usuariosPaginados.map((u) => (
                            <div
                                key={u.idUsuario}
                                className="bg-white border border-slate-200 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
                            >
                                {/* Avatar */}
                                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm ${['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'][
                                    ((u.nombre?.charCodeAt(0) || 0) + (u.apellido?.charCodeAt(0) || 0)) % 8
                                ]
                                    }`}>
                                    {((u.nombre?.[0] || '') + (u.apellido?.[0] || '')).toUpperCase() || '?'}
                                </div>

                                {/* ID */}
                                <div className="shrink-0 text-center sm:text-left sm:w-40">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                                        ID
                                    </span>
                                    <span className="text-2xl font-black text-slate-900 italic block">
                                        {u.idUsuario}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-500 block mt-1 break-all pr-2">
                                        {u.email}
                                    </span>
                                </div>

                                {/* Separador vertical */}
                                <div className="hidden sm:block w-px h-14 bg-slate-100 shrink-0" />

                                {/* Info usuario */}
                                <div className="flex-1 space-y-1 min-w-0">
                                    <p className="font-black text-slate-800 text-base leading-tight truncate">
                                        {u.apellido || '—'} {u.nombre}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        <span className="font-bold text-slate-600">Dirección: </span>
                                        {u.direccion || <span className="italic text-slate-400">Sin dirección</span>}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        <span className="font-bold text-slate-600">Teléfono: </span>
                                        {u.telefono || <span className="italic text-slate-400">Sin teléfono</span>}
                                    </p>
                                    {u.nivel && (
                                        <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-brand-yellow/30 text-slate-700 px-2 py-0.5 rounded mt-1">
                                            {((nombre) => {
                                                switch (nombre?.toLowerCase()) {
                                                    case 'aprendiz': return 1;
                                                    case 'constructor': return 2;
                                                    case 'arquitecto': return 3;
                                                    case 'experto': return 4;
                                                    case 'maestro': return 5;
                                                    default: return 1;
                                                }
                                            })(u.nivel.nombre)} - {u.nivel.nombre}
                                        </span>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-3 shrink-0 flex-wrap">
                                    <button
                                        onClick={() => handleEnviarCorreo(u.email)}
                                        className="flex items-center gap-1.5 border border-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
                                        title={u.email}
                                    >
                                        <Mail size={13} />
                                        Enviar correo
                                    </button>
                                    <button
                                        onClick={() => handleVerCompras(u)}
                                        className="flex items-center gap-1.5 border border-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
                                    >
                                        <ShoppingBag size={13} />
                                        Ver compras
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Ver más */}
                        {usuariosFiltrados.length > visibleCount && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => setVisibleCount((prev) => prev + 6)}
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

            {/* Modal Ver Compras */}
            {modalUsuario && (
                <VerComprasModal
                    usuario={modalUsuario}
                    pedidos={loadingPedidos ? [] : pedidosTodos}
                    onClose={() => setModalUsuario(null)}
                />
            )}
        </div>
    );
};

export default AdminUsuarios;
