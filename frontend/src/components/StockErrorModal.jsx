import { X, AlertTriangle } from 'lucide-react';

const StockErrorModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-red-100 flex flex-col items-center text-center">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition p-2">
                    <X size={20} />
                </button>

                <div className="w-16 h-16 bg-red-50 text-brand-red rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100 animate-bounce">
                    <AlertTriangle size={32} />
                </div>

                <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-wide">
                    ¡Stock Límite!
                </h2>

                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8">
                    {message}
                </p>

                <button 
                    onClick={onClose} 
                    className="w-full bg-slate-900 hover:bg-brand-red text-white font-black py-4 rounded-xl shadow-lg transition duration-300 uppercase tracking-widest text-xs"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};

export default StockErrorModal;
