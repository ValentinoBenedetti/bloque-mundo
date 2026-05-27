import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useDocumentTitle from '../hooks/useDocumentTitle';
import sadLego from '../assets/sad-lego.png';

const NotFound = () => {
    useDocumentTitle('Página no encontrada');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto px-4 py-20 w-full flex flex-col items-center justify-center text-center animate-fade-in-up">
                
                <div className="relative mb-8 group">
                    <img 
                        src={sadLego} 
                        alt="Lego Triste" 
                        className="w-48 md:w-64 drop-shadow-2xl opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute -top-4 -right-4 bg-brand-red text-white text-3xl font-black font-logo py-2 px-4 rounded-xl shadow-lg rotate-12 group-hover:rotate-[20deg] transition-transform">
                        404
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">
                    ¡Ups! Ruta Desarmada
                </h1>
                
                <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-xl leading-relaxed">
                    Parece que intentaste buscar una pieza que no está en nuestro inventario. 
                    No te preocupes, siempre podemos volver a armar algo increíble.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 bg-brand-red hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <Home size={20} />
                        Volver al Inicio
                    </button>
                    
                    <button 
                        onClick={() => navigate('/tienda')}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold uppercase tracking-wider shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                    >
                        <Compass size={20} />
                        Explorar Tienda
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotFound;
