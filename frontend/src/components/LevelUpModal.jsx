import React from 'react';
import { Award, Sparkles, Shield, Trophy, ArrowRight, X } from 'lucide-react';

const LevelUpModal = ({ isOpen, onClose, prevLevel, newLevel }) => {
    if (!isOpen || !newLevel) return null;

    // Traducir nombre de nivel a su respectivo número
    const getLevelNumber = (nombre) => {
        switch (nombre?.toLowerCase()) {
            case 'aprendiz': return 1;
            case 'constructor': return 2;
            case 'arquitecto': return 3;
            case 'experto': return 4;
            case 'maestro': return 5;
            default: return 1;
        }
    };

    const prevNum = prevLevel ? getLevelNumber(prevLevel.nombre) : 1;
    const newNum = getLevelNumber(newLevel.nombre);

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
            {/* Confetti decorativo en CSS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute top-20 right-20 w-4 h-4 bg-rose-500 rotate-45 animate-pulse"></div>
                <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-blue-500 rounded-xs animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute bottom-10 right-1/3 w-4 h-4 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="bg-white rounded-[36px] shadow-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 relative border-4 border-brand-yellow">
                {/* Botón cerrar */}
                <button 
                    onClick={onClose}
                    className="absolute right-5 top-5 p-1 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                    <X size={18} />
                </button>

                {/* Banner superior con fondo Lego amarillo brillante */}
                <div className="bg-gradient-to-br from-brand-yellow via-amber-400 to-amber-500 p-8 text-center relative overflow-hidden">
                    {/* Estructura de círculos simulando los botones de un bloque de Lego */}
                    <div className="absolute -top-6 -left-6 w-16 h-16 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
                    
                    {/* Icono de Trofeo animado */}
                    <div className="relative mx-auto w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg animate-bounce">
                        <Trophy className="text-amber-500 animate-pulse" size={44} />
                        <Sparkles className="absolute -top-2 -right-2 text-rose-500 animate-spin" size={20} />
                        <Sparkles className="absolute -bottom-2 -left-2 text-blue-500" size={16} />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mt-4 tracking-tight uppercase italic leading-none">
                        ¡Subiste de Nivel!
                    </h2>
                    <p className="text-slate-950 font-bold text-xs uppercase tracking-widest mt-1.5 opacity-80">
                        Nivel de Constructor Actualizado
                    </p>
                </div>

                <div className="p-8 text-center bg-white">
                    {/* Visualización de la transición de nivel */}
                    <div className="flex items-center justify-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 shadow-xs">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anterior</span>
                            <div className="flex items-center gap-1.5 mt-1 bg-slate-200/60 px-3 py-1 rounded-full text-slate-600 font-bold text-xs">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                {prevLevel?.nombre || 'Aprendiz'}
                            </div>
                        </div>
                        
                        <ArrowRight className="text-slate-400 mt-4" size={20} />

                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">¡Nuevo Nivel!</span>
                            <div className="flex items-center gap-1.5 mt-1 bg-brand-red text-white px-3.5 py-1.5 rounded-full font-black text-xs shadow-md shadow-red-100 uppercase italic animate-pulse">
                                <Award className="text-brand-yellow shrink-0" size={14} />
                                {newLevel.nombre}
                            </div>
                        </div>
                    </div>

                    {/* Beneficios obtenidos */}
                    <div className="text-left mb-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2 text-center">
                            Tus nuevos beneficios de constructor
                        </h3>
                        <div className="space-y-3.5">
                            {/* Descuento por compras */}
                            <div className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                <div className="p-1 bg-amber-500 rounded-lg text-white mt-0.5">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Descuento Exclusivo</h4>
                                    <p className="text-amber-900 text-xs mt-0.5 leading-relaxed font-medium">
                                        ¡Ahora tienes un <strong className="font-extrabold text-amber-600 text-sm">{Number(newLevel.porcentajeDescuento)}% OFF</strong> permanente en todos los productos de la tienda!
                                    </p>
                                </div>
                            </div>

                            {/* Detalle del beneficio de la BD */}
                            {newLevel.beneficio && newLevel.beneficio !== 'Sin beneficios extra' && (
                                <div className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                    <div className="p-1 bg-emerald-500 rounded-lg text-white mt-0.5">
                                        <Award size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Beneficios del Rango</h4>
                                        <p className="text-emerald-900 text-xs mt-0.5 leading-relaxed font-semibold italic">
                                            "{newLevel.beneficio}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botón Aceptar */}
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-4 bg-slate-900 text-white font-black hover:bg-black rounded-2xl shadow-xl shadow-slate-200 transition duration-200 text-xs uppercase tracking-widest italic cursor-pointer active:scale-98"
                    >
                        ¡Excelente! A seguir construyendo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelUpModal;
