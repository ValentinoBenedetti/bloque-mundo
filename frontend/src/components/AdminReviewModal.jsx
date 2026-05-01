import React, { useState, useEffect } from 'react';
import { Star, X, Trash2 } from 'lucide-react';
import { getReviewForAdminRequest, deleteReviewAdminRequest } from '../api/resenas';

const AdminReviewModal = ({ isOpen, onClose, idUsuario, idProducto, idPedido, productoNombre }) => {
    const [resena, setResena] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && idUsuario && idProducto) {
            const fetchReview = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await getReviewForAdminRequest(idUsuario, idProducto, idPedido);
                    setResena(data);
                } catch (err) {
                    setError("Error al cargar la reseña.");
                } finally {
                    setLoading(false);
                }
            };
            fetchReview();
        }
    }, [isOpen, idUsuario, idProducto]);

    const handleDelete = async () => {
        if (!resena) return;
        
        try {
            await deleteReviewAdminRequest(resena.idResena);
            setResena({ ...resena, eliminadaPorAdmin: true });
            setShowConfirm(false);
        } catch (err) {
            alert("No se pudo eliminar la reseña.");
        }
    };

    if (!isOpen) return null;

    const getRatingText = (estrellas) => {
        switch (estrellas) {
            case 5: return "EXCELENTE";
            case 4: return "MUY BUENO";
            case 3: return "BUENO";
            case 2: return "REGULAR";
            case 1: return "MALO";
            default: return "";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
                    <X size={20} />
                </button>

                {loading ? (
                    <div className="py-10 text-center animate-pulse text-slate-400">Cargando reseña...</div>
                ) : error ? (
                    <div className="py-10 text-center text-brand-red font-bold">{error}</div>
                ) : !resena ? (
                    <div className="py-10 text-center text-slate-500 font-medium">El usuario no dejo ninguna reseña.</div>
                ) : (
                    <div className="border border-slate-200 rounded-lg p-5 mt-4 relative">
                        {/* Rating y botón eliminar */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        className={star <= resena.estrellas ? 'fill-brand-yellow text-brand-yellow' : 'text-slate-200 fill-slate-200'}
                                    />
                                ))}
                            </div>
                            {!resena.eliminadaPorAdmin && !showConfirm && (
                                <button onClick={() => setShowConfirm(true)} className="text-slate-400 hover:text-brand-red transition">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        {showConfirm ? (
                            <div className="py-4 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-sm font-bold text-slate-800 mb-4">¿Estás seguro que quieres eliminar esta reseña?</p>
                                <div className="flex gap-3 justify-center">
                                    <button 
                                        onClick={() => setShowConfirm(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition uppercase tracking-wider"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="px-4 py-2 text-xs font-bold bg-brand-red text-white rounded hover:bg-red-700 transition uppercase tracking-wider shadow-md shadow-red-100"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ) : resena.eliminadaPorAdmin ? (
                            <div className="py-8 text-center text-brand-red font-bold">
                                Reseña eliminada por el administrador.
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-slate-800 mb-2">{getRatingText(resena.estrellas)}</h3>
                                <p className="text-sm text-slate-600 mb-6 break-words">{resena.comentario}</p>
                                
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">
                                            {resena.esAnonima ? "Anónimo" : `${resena.usuario?.nombre} ${resena.usuario?.apellido || ''}`}
                                        </span>
                                        <span className="text-[10px] text-slate-400">Producto: {productoNombre}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviewModal;
