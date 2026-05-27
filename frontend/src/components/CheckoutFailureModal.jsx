import React from 'react';
import { XCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CheckoutFailureModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

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
                    {/* XCircle rojo */}
                    <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="text-red-500" size={24} />
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        ¡Pago Rechazado!
                    </h2>
                    
                    <p className="text-slate-500 text-xs leading-relaxed px-4 font-medium mb-5">
                        Lo sentimos, tu compra no pudo ser procesada o fue cancelada. Puedes intentarlo de nuevo desde tu carrito.
                    </p>

                    {/* Ilustración de Lego triste */}
                    <div className="relative rounded-2xl overflow-hidden mb-8 border border-slate-100 shadow-sm max-h-[190px] flex items-center justify-center bg-slate-50">
                        <img
                            src="/assets/compra_fallida_lego.png"
                            className="w-full h-full object-cover"
                            alt="Compra Fallida Lego"
                        />
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                            <span className="bg-slate-900/80 text-white font-black uppercase tracking-wider text-xs px-3 py-1 rounded-full backdrop-blur-xs">
                                ¡No se pudo comprar!
                            </span>
                        </div>
                    </div>

                    {/* Botón Volver a la tienda */}
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/tienda');
                        }}
                        className="w-full px-4 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 text-sm uppercase tracking-wider mb-4 cursor-pointer"
                    >
                        Volver a la tienda
                    </button>

                    {/* Link Contáctanos */}
                    <p className="text-slate-400 text-[10px] font-bold">
                        ¿Tienes dudas o problemas con el pago?{' '}
                        <a 
                            href="mailto:bloquemundoo@gmail.com" 
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

export default CheckoutFailureModal;
