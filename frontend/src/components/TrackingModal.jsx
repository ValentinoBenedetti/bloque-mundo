import React from 'react';
import { X, Package, Truck, CheckCircle, MapPin, Calendar, Hash } from 'lucide-react';

const TrackingModal = ({ isOpen, onClose, pedido }) => {
    if (!isOpen || !pedido) return null;

    const envio = pedido.envio || {};
    const estadoEnvio = envio.estado || 'Pendiente';

    // Definición de los pasos del envío
    const steps = [
        { label: 'Pendiente', icon: Package, key: 'Pendiente' },
        { label: 'En tránsito', icon: Truck, key: 'En tránsito' },
        { label: 'Entregado', icon: CheckCircle, key: 'Entregado' }
    ];

    // Determinar el índice del estado actual para pintar los puntos
    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.key === estadoEnvio);
    };

    // Función para limpiar la dirección y extraer el CP si viene pegado
    const procesarDireccion = () => {
        let dir = envio.direccion || 'Dirección no registrada';
        let cp = envio.codigoPostal || '0000';

        // Intentar buscar un patrón de CP Argentino (ej: B2760 o 2760) al final de la dirección
        const cpMatch = dir.match(/([A-Z]?(\d{4})[A-Z]{0,3})$/);
        if (cpMatch) {
            cp = cpMatch[2]; // Tomamos solo el grupo de los 4 dígitos
            // Quitar todo el bloque del CP (con letras) de la dirección
            dir = dir.replace(cpMatch[1], '').replace(/,?\s*$/, '');
        }

        return { direccionLimpia: dir, codigoPostal: cp };
    };

    const { direccionLimpia, codigoPostal } = procesarDireccion();
    const currentStepIndex = getCurrentStepIndex();

    // Colores según el estado
    const getStatusColor = () => {
        if (estadoEnvio === 'Entregado') return 'bg-green-500';
        if (estadoEnvio === 'En tránsito') return 'bg-yellow-400';
        return 'bg-brand-red';
    };

    const statusColor = getStatusColor();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-2xl font-bold">Seguimiento de Envío</h2>
                        <p className="text-slate-400 text-sm mt-1">Pedido #{pedido.idPedido} • ID Envío: {envio.idEnvio || 'N/A'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    {/* Progress Bar (The 3 dots) */}
                    <div className="relative mb-12">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
                        <div 
                            className={`absolute top-1/2 left-0 h-1 ${statusColor} -translate-y-1/2 transition-all duration-1000`}
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        ></div>

                        <div className="relative flex justify-between">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                // Lógica de colores semáforo
                                let stepColor = 'bg-white border-4 border-slate-100 text-slate-300';
                                if (isCompleted) {
                                    if (index === 0) stepColor = 'bg-brand-red text-white'; // Pendiente -> Rojo
                                    if (index === 1) stepColor = 'bg-yellow-400 text-slate-900'; // En tránsito -> Amarillo
                                    if (index === 2) stepColor = 'bg-green-500 text-white'; // Entregado -> Verde
                                }

                                return (
                                    <div key={index} className="flex flex-col items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${stepColor} ${
                                            isCurrent ? 'ring-4 ring-slate-100 scale-110 shadow-lg' : ''
                                        }`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                                            isCompleted ? 'text-slate-800' : 'text-slate-400'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detalle del Pedido */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Información de Entrega</h4>
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-brand-red shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-slate-800 leading-tight">{direccionLimpia}</p>
                                    <p className="text-sm text-slate-500 font-medium">CP: {codigoPostal}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-brand-red" />
                                <p className="text-sm text-slate-600">
                                    <span className="font-bold">Fecha de compra:</span> {new Date(pedido.fecha).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 border-l border-slate-200 pl-8">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen del Paquete</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {pedido.lineas?.map((linea, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">
                                            <span className="font-bold text-slate-800">{linea.cantidad}x</span> {linea.producto?.titulo || linea.combo?.titulo}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Estado actual</p>
                                <p className="text-lg font-black text-slate-800 italic uppercase leading-tight mt-1">
                                    {estadoEnvio === 'Entregado' ? '¡Tu paquete llegó!' : 
                                     estadoEnvio === 'En tránsito' ? 'En camino a tu casa' : 
                                     'Preparando tu pedido'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-slate-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-700 transition shadow-lg"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrackingModal;
