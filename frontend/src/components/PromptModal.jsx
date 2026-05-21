import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

const PromptModal = ({ isOpen, onClose, onSubmit, title, message, placeholder = "", confirmText = "Aceptar", cancelText = "Cancelar" }) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSubmit(inputValue.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                <form onSubmit={handleSubmit} className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="text-blue-500" size={32} />
                    </div>
                    
                    <h2 className="text-xl font-black text-slate-900 uppercase italic mb-2">
                        {title}
                    </h2>
                    
                    {message && (
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            {message}
                        </p>
                    )}

                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium mb-8 text-center"
                        autoFocus
                    />

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 transition uppercase tracking-widest text-xs"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-black shadow-lg shadow-slate-200 transition uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromptModal;
