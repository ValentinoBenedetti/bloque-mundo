import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, title, message, buttonText = "Entendido" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center">
                    <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce duration-1000">
                        <CheckCircle2 className="text-green-500" size={40} />
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-3 tracking-tight">
                        {title}
                    </h2>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-4 rounded-xl bg-slate-900 text-white font-black hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 uppercase tracking-widest text-xs italic"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
