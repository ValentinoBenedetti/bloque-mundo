import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

const CheckoutSuccessModal = ({ isOpen, onClose, pedido, paymentId = 'N/A' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in zoom-in-95 duration-300 relative border border-slate-100 custom-scrollbar">
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
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
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

                        {/* Productos comprados */}
                        {pedido?.lineas && pedido.lineas.length > 0 && (
                            <div className="border-t border-slate-200 pt-3 mb-4 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Productos adquiridos</span>
                                <div className="flex flex-col gap-2">
                                    {pedido.lineas.map((linea, index) => {
                                        const nombre = linea.producto?.titulo || linea.combo?.titulo || 'Producto';
                                        return (
                                            <div key={index} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                <div className="flex flex-col max-w-[65%]">
                                                    <span className="text-xs font-bold text-slate-800 truncate" title={nombre}>{nombre}</span>
                                                    <span className="text-[10px] font-bold text-slate-500">Cantidad: {linea.cantidad}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-900">
                                                    ${Number(linea.precioHistorico || linea.precioUnitario || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })} c/u
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-3 pt-4 border-t-2 border-slate-200 flex flex-col bg-slate-100 rounded-lg p-3">
                            {(() => {
                                const costoEnvio = pedido?.envio?.costo ? Number(pedido.envio.costo) : 0;
                                const subtotal = pedido?.lineas?.reduce((acc, linea) => acc + (Number(linea.precioHistorico || linea.precioUnitario || 0) * linea.cantidad), 0) || 0;
                                const total = Number(pedido?.total || 0);
                                const descuento = (subtotal + costoEnvio) > total ? (subtotal + costoEnvio) - total : 0;

                                return (
                                    <>
                                        {(descuento > 0 || costoEnvio > 0) && (
                                            <div className="flex flex-col gap-1 w-full border-b border-slate-200 pb-2 mb-2">
                                                <div className="flex justify-between items-center px-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Subtotal</span>
                                                    <span className="text-xs font-bold text-slate-700">${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                                                </div>
                                                {costoEnvio > 0 && (
                                                <div className="flex justify-between items-center px-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Costo de envío</span>
                                                    <span className="text-xs font-bold text-slate-700">${costoEnvio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                                                </div>
                                                )}
                                                {descuento > 0 && (
                                                <div className="flex justify-between items-center px-2">
                                                    <span className="text-[10px] font-bold text-green-600 uppercase">Descuentos aplicados</span>
                                                    <span className="text-xs font-bold text-green-600">-${descuento.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                                                </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Total Pagado</span>
                                            <span className="font-black text-brand-red text-3xl">
                                                ${total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </>
                                );
                            })()}
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
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=bloquemundoo@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
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
