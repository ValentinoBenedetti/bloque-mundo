import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { isCartOpen } = useCart();
    const { isProfileSidebarOpen } = useAuth();

    useEffect(() => {
        const toggleVisibility = () => {
            // Mostrar el botón cuando el usuario hace scroll hacia abajo (ej. 400px)
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible || isCartOpen || isProfileSidebarOpen) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[9999] bg-slate-900 text-brand-yellow p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-black hover:-translate-y-1 transition-all duration-300 flex items-center justify-center border-2 border-brand-yellow animate-fade-in-up"
            title="Ir arriba"
        >
            <ArrowUp size={24} strokeWidth={3} />
        </button>
    );
};

export default ScrollToTopButton;
