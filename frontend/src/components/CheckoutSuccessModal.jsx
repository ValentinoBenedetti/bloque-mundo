import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

const CheckoutSuccessModal = ({ isOpen, onClose, pedido, paymentId = 'N/A' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative border border-slate-100">
                {/* Botón cerrar */}
                <button 
                    onClick={onClose}
                    className="absolute right-5 top-5 p-1 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                    <X size={18} />
                </button>

                <div className="p-8 text-center">
                    {/* Checkmark verde */}
                    <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="text-green-500" size={24} />
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        ¡Gracias por tu compra!
                    </h2>
                    
                    <p className="text-slate-500 text-xs leading-relaxed px-4 font-medium">
                        Tu pedido ha sido procesado correctamente. Te hemos enviado un email con los detalles.
                    </p>

                    {/* Ilustración de Lego */}
                    <div className="relative rounded-2xl overflow-hidden my-5 border border-slate-100 shadow-sm max-h-[190px] flex items-center justify-center bg-slate-50">
                        <img
                            src="/assets/compra_exitosa_lego.png"
                            className="w-full h-full object-cover"
                            alt="Compra Exitosa Lego"
                        />
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                            <span className="bg-slate-900/80 text-white font-black uppercase tracking-wider text-xs px-3 py-1 rounded-full backdrop-blur-xs">
                                ¡Compra Exitosa!
                            </span>
                        </div>
                    </div>

                    {/* Resumen de la operación */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-3">
                            Resumen de la operación
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Nº de Orden</span>
                                <span className="font-black text-slate-800 text-sm">
                                    #{pedido?.idPedido || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">ID Operación MP</span>
                                <span className="font-bold text-slate-600 text-xs truncate block" title={paymentId}>
                                    {paymentId}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Total Pagado</span>
                            <span className="font-black text-brand-red text-base">
                                ${Number(pedido?.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>

                    {/* Botón Volver a la tienda */}
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 text-sm uppercase tracking-wider mb-4 cursor-pointer"
                    >
                        Volver a la tienda
                    </button>

                    {/* Link Contáctanos */}
                    <p className="text-slate-400 text-[10px] font-bold">
                        ¿Tienes dudas?{' '}
                        <a 
                            href="mailto:soporte@bloquemundo.com" 
                            className="text-slate-600 hover:text-slate-900 underline transition"
                        >
                            Contáctanos
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessModal;
