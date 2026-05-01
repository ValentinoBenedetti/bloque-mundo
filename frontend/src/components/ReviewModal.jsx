import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { createResenaRequest, checkUserReviewRequest } from '../api/resenas';

const ReviewModal = ({ isOpen, onClose, product, idPedido, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            const checkReview = async () => {
                setLoading(true);
                try {
                    const res = await checkUserReviewRequest(product.idProducto, idPedido);
                    if (res.hasReviewed && res.resena) {
                        if (res.resena.eliminadaPorAdmin) {
                            setIsDeleted(true);
                            setIsReadOnly(true);
                        } else {
                            setRating(res.resena.estrellas);
                            setComment(res.resena.comentario);
                            setIsAnonymous(res.resena.esAnonima);
                            setIsReadOnly(true);
                            setIsDeleted(false);
                        }
                    } else {
                        // Reset form for new review
                        setRating(0);
                        setComment('');
                        setIsAnonymous(true);
                        setIsReadOnly(false);
                        setIsDeleted(false);
                        setError(null);
                    }
                } catch (err) {
                    console.error("Error checking review:", err);
                } finally {
                    setLoading(false);
                }
            };
            checkReview();
        }
    }, [isOpen, product]);

    if (!isOpen) return null;

    const wordCount = comment.trim() === '' ? 0 : comment.trim().split(/\s+/).length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        
        setError(null);

        if (rating === 0) {
            setError("Por favor, selecciona una calificación.");
            return;
        }

        if (wordCount > 200) {
            setError("El comentario no puede superar las 200 palabras.");
            return;
        }

        setLoading(true);
        try {
            await createResenaRequest({
                idProducto: product.idProducto,
                idPedido: idPedido,
                comentario: comment,
                estrellas: rating,
                esAnonima: isAnonymous
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || "No se pudo enviar la reseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">
                            {isDeleted ? 'Reseña eliminada' : isReadOnly ? 'Tu opinión enviada' : 'Opinar sobre el producto'}
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                            <X size={24} />
                        </button>
                    </div>

                    {isDeleted ? (
                        <div className="bg-red-50 p-6 rounded-xl text-center border border-red-100">
                            <p className="text-sm font-bold text-brand-red">
                                Tu reseña para este producto ha sido eliminada por un administrador.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center mb-8">
                                <p className="text-sm font-medium text-slate-500 mb-3">
                                    {isReadOnly ? 'Calificaste este producto con:' : `¿Qué te pareció el ${product.titulo}?`}
                                </p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => !isReadOnly && setRating(star)}
                                    onMouseEnter={() => !isReadOnly && setHover(star)}
                                    onMouseLeave={() => !isReadOnly && setHover(0)}
                                    className={`transition-transform ${!isReadOnly ? 'hover:scale-110 active:scale-95' : 'cursor-default'}`}
                                    disabled={isReadOnly}
                                >
                                    <Star
                                        size={36}
                                        className={`transition-colors ${
                                            star <= (hover || rating)
                                                ? 'fill-brand-yellow text-brand-yellow'
                                                : 'text-slate-200 fill-slate-200'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                {isReadOnly ? 'Tu comentario enviado' : 'Tu comentario'}
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => !isReadOnly && setComment(e.target.value)}
                                readOnly={isReadOnly}
                                placeholder={isReadOnly ? "" : "Cuéntanos tu experiencia con este set..."}
                                className={`w-full p-4 border-2 rounded-xl outline-none transition h-32 text-sm resize-none ${
                                    isReadOnly 
                                    ? 'bg-slate-50 border-transparent text-slate-600 italic' 
                                    : 'bg-slate-50 border-slate-100 focus:border-brand-red focus:bg-white'
                                }`}
                            ></textarea>
                            {!isReadOnly && (
                                <div className="flex justify-between mt-1 px-1">
                                    <span className={`text-[10px] font-bold ${wordCount > 200 ? 'text-brand-red' : 'text-slate-400'}`}>
                                        {wordCount} / 200 palabras
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <label className={`relative inline-flex items-center ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                                <input 
                                    type="checkbox" 
                                    checked={isAnonymous} 
                                    onChange={(e) => !isReadOnly && setIsAnonymous(e.target.checked)} 
                                    disabled={isReadOnly}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red opacity-80"></div>
                            </label>
                            <span className="text-sm font-medium text-slate-600">Publicada como reseña anónima</span>
                        </div>

                        {error && (
                            <p className="text-xs font-bold text-brand-red bg-red-50 p-3 rounded-lg border border-red-100 animate-shake">
                                {error}
                            </p>
                        )}

                        {!isReadOnly ? (
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest"
                            >
                                {loading ? 'Enviando...' : 'Publicar reseña'}
                            </button>
                        ) : (
                            <div className="bg-slate-100 p-4 rounded-xl text-center">
                                <p className="text-sm font-bold text-slate-500">
                                    Ya has opinado sobre este producto. ¡Gracias por tu feedback!
                                </p>
                            </div>
                        )}
                    </form>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
