import { useState, useEffect } from 'react';
import { X, Trash2, Plus, Percent, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import { getCuponesRequest, createCuponRequest, deleteCuponRequest } from '../api/cupones';

const CuponModal = ({ isOpen, onClose }) => {
    const [cupones, setCupones] = useState([]);
    const [temas, setTemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        codigo: '',
        porcentaje: '',
        fechaInicio: '',
        fechaFin: '',
        condicion: '',
        topeUso: '',
        montoMinimo: '',
        idTemaRequerido: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchCupones();
            fetchTemas();
        }
    }, [isOpen]);

    const fetchCupones = async () => {
        setLoading(true);
        try {
            const data = await getCuponesRequest();
            setCupones(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemas = async () => {
        try {
            const res = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/temas');
            const data = await res.json();
            setTemas(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCuponRequest({
                ...formData,
                porcentaje: parseFloat(formData.porcentaje),
                topeUso: formData.topeUso ? parseInt(formData.topeUso, 10) : 0,
                montoMinimo: formData.montoMinimo ? parseFloat(formData.montoMinimo) : 0,
                idTemaRequerido: formData.idTemaRequerido ? parseInt(formData.idTemaRequerido, 10) : null,
            });
            setFormData({
                codigo: '',
                porcentaje: '',
                fechaInicio: '',
                fechaFin: '',
                condicion: '',
                topeUso: '',
                montoMinimo: '',
                idTemaRequerido: '',
            });
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Cupón creado correctamente',
                confirmButtonColor: '#10b981',
                timer: 1500,
                showConfirmButton: false
            });
            fetchCupones();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Error al crear cupón',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleDelete = async (codigo) => {
        const result = await Swal.fire({
            title: `¿Eliminar cupón ${codigo}?`,
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteCuponRequest(codigo);
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El cupón ha sido eliminado.',
                    confirmButtonColor: '#10b981',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchCupones();
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Error al eliminar cupón',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-wider">Gestionar Cupones</h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">Crea, consulta y elimina cupones con reglas de negocio reales</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50">
                    {/* COLUMNA FORMULARIO */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 border-b pb-2">Crear Nuevo Cupón</h3>
                        <form onSubmit={handleCreate} className="space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</label>
                                        <input 
                                            type="text" 
                                            value={formData.codigo}
                                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                                            placeholder="EJ: STAR10"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-red font-bold uppercase transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descuento (%)</label>
                                        <input 
                                            type="number" 
                                            value={formData.porcentaje}
                                            onChange={(e) => setFormData({ ...formData, porcentaje: e.target.value })}
                                            placeholder="EJ: 15"
                                            min="1"
                                            max="100"
                                            step="0.01"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-red font-bold transition"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compra Mínima ($)</label>
                                        <input 
                                            type="number" 
                                            value={formData.montoMinimo}
                                            onChange={(e) => setFormData({ ...formData, montoMinimo: e.target.value })}
                                            placeholder="0 = Sin mínimo"
                                            min="0"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-red transition font-bold"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temática Requerida</label>
                                        <select
                                            value={formData.idTemaRequerido}
                                            onChange={(e) => setFormData({ ...formData, idTemaRequerido: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-red transition font-bold text-slate-700"
                                        >
                                            <option value="">Cualquier temática</option>
                                            {temas.map((t) => (
                                                <option key={t.idTema} value={t.idTema}>{t.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inicio</label>
                                        <input 
                                            type="date" 
                                            value={formData.fechaInicio}
                                            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-red transition font-bold text-slate-700"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fin</label>
                                        <input 
                                            type="date" 
                                            value={formData.fechaFin}
                                            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-red transition font-bold text-slate-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condición de muestra (Texto)</label>
                                    <input 
                                        type="text" 
                                        value={formData.condicion}
                                        onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                                        placeholder="EJ: Exclusivo para fanáticos de Star Wars"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-red transition"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tope de Usos (0 = Ilimitado)</label>
                                    <input 
                                        type="number" 
                                        value={formData.topeUso}
                                        onChange={(e) => setFormData({ ...formData, topeUso: e.target.value })}
                                        placeholder="EJ: 50"
                                        min="0"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-red transition font-bold"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-brand-red text-white font-black py-3 rounded-lg shadow hover:bg-red-700 transition uppercase tracking-widest text-xs mt-6"
                            >
                                Crear Cupón
                            </button>
                        </form>
                    </div>

                    {/* COLUMNA LISTA DE CUPONES */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 border-b pb-2">Cupones Vigentes</h3>
                        {loading ? (
                            <p className="text-sm text-slate-400 italic my-auto text-center">Cargando cupones...</p>
                        ) : cupones.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <Percent size={40} className="text-slate-200 mb-2" />
                                <p className="text-sm font-bold text-slate-400">No hay cupones creados aún</p>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                                {[...cupones].sort((a, b) => {
                                    const isExpired = (c) => {
                                        const now = new Date();
                                        const [year, month, day] = c.fechaFin.split('-');
                                        const endDate = new Date(year, month - 1, day, 23, 59, 59);
                                        if (now > endDate) return true;
                                        if (c.topeUso > 0 && c.pedidos && c.pedidos.length >= c.topeUso) return true;
                                        return false;
                                    };
                                    const aExpired = isExpired(a);
                                    const bExpired = isExpired(b);
                                    if (aExpired && !bExpired) return 1;
                                    if (!aExpired && bExpired) return -1;
                                    return 0;
                                }).map((c) => {
                                    const now = new Date();
                                    const [year, month, day] = c.fechaFin.split('-');
                                    const endDate = new Date(year, month - 1, day, 23, 59, 59);
                                    const isDateExpired = now > endDate;
                                    const isUsageExpired = c.topeUso > 0 && c.pedidos && c.pedidos.length >= c.topeUso;
                                    const expired = isDateExpired || isUsageExpired;

                                    return (
                                    <div key={c.codigo} className={`bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-slate-300 transition shadow-sm ${expired ? 'opacity-60 grayscale' : ''}`}>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-black px-2.5 py-1 rounded text-xs uppercase tracking-wider ${expired ? 'bg-slate-400 text-white' : 'bg-slate-900 text-brand-yellow'}`}>{c.codigo}</span>
                                                <span className={`text-white text-xs font-black px-2 py-0.5 rounded ${expired ? 'bg-slate-400' : 'bg-brand-red'}`}>-{c.porcentaje}%</span>
                                                {expired && (
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 border border-slate-300 px-1.5 py-0.5 rounded">
                                                        {isUsageExpired ? 'Agotado' : 'Expirado'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-3 pt-1">
                                                <span>Válido: {c.fechaInicio} al {c.fechaFin}</span>
                                                {c.topeUso > 0 && <span>• Usos: {c.pedidos?.length || 0}/{c.topeUso}</span>}
                                            </div>
                                            <div className="text-[11px] text-slate-700 font-bold flex gap-2 pt-0.5">
                                                {c.montoMinimo > 0 && <span className="bg-slate-200 px-2 py-0.5 rounded">Mín: ${Number(c.montoMinimo).toLocaleString('es-AR')}</span>}
                                                {c.temaRequerido && <span className="bg-brand-yellow/30 text-slate-900 px-2 py-0.5 rounded">Tema: {c.temaRequerido.nombre}</span>}
                                            </div>
                                            {c.condicion && (
                                                <p className="text-[11px] text-slate-600 font-bold italic pt-1">{c.condicion}</p>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(c.codigo)}
                                            className="text-slate-300 hover:text-brand-red transition p-2 shrink-0"
                                            title="Eliminar cupón"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CuponModal;
