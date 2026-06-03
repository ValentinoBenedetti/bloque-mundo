import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import vexaLogo from '../assets/vexa-logo.png';
import Logo from './Logo';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="w-full bg-brand-dark border-t-4 border-brand-yellow text-slate-300 py-16 px-6 md:px-16 z-20 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
                
                {/* COLUMNA 1: LOGO Y INFO */}
                <div className="space-y-4">
                    <div 
                        onClick={() => {
                            if (window.location.pathname === '/') {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                navigate('/');
                                window.scrollTo(0, 0);
                            }
                        }} 
                        className="cursor-pointer w-max"
                    >
                        <Logo size="footer" textOnly={true} animated={false} className="text-brand-yellow hover:text-white transition" />
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Tu tienda favorita de bloques y figuras de colección en Concepción del Uruguay. Creamos diversión pieza por pieza.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <a 
                            href="https://instagram.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-yellow hover:text-brand-dark transition duration-300"
                        >
                            <FaInstagram size={16} />
                        </a>
                        <a 
                            href="https://facebook.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-yellow hover:text-brand-dark transition duration-300"
                        >
                            <FaFacebookF size={14} />
                        </a>
                        <a 
                            href="https://wa.me/5493442000000" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-yellow hover:text-brand-dark transition duration-300"
                        >
                            <FaWhatsapp size={16} />
                        </a>
                    </div>
                </div>

                {/* COLUMNA 2: ENLACES */}
                <div>
                    <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs border-b border-slate-850 pb-2">Navegación</h3>
                    <ul className="space-y-2 text-xs md:text-sm">
                        <li>
                            <button 
                                onClick={() => {
                                    if (window.location.pathname === '/') {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } else {
                                        navigate('/');
                                        window.scrollTo(0, 0);
                                    }
                                }} 
                                className="hover:text-brand-yellow hover:translate-x-1 transition duration-300 cursor-pointer flex items-center gap-1 bg-transparent border-none p-0 text-slate-300 font-normal outline-none"
                            >
                                Inicio
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => navigate('/tienda')} 
                                className="hover:text-brand-yellow hover:translate-x-1 transition duration-300 cursor-pointer flex items-center gap-1 bg-transparent border-none p-0 text-slate-300 font-normal outline-none"
                            >
                                Tienda
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => navigate('/nosotros')} 
                                className="hover:text-brand-yellow hover:translate-x-1 transition duration-300 cursor-pointer flex items-center gap-1 bg-transparent border-none p-0 text-slate-300 font-normal outline-none"
                            >
                                Nosotros
                            </button>
                        </li>
                    </ul>
                </div>

                {/* COLUMNA 3: SOPORTE */}
                <div>
                    <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs border-b border-slate-855 pb-2">Ayuda y Soporte</h3>
                    <ul className="space-y-2 text-xs md:text-sm">
                        <li>
                            <a 
                                href="/politicas-de-compra.pdf" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-brand-yellow transition duration-300 cursor-pointer text-slate-300 no-underline"
                            >
                                Políticas de Compra
                            </a>
                        </li>
                        <li>
                            <a 
                                href="/preguntas-frecuentes.pdf" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-brand-yellow transition duration-300 cursor-pointer text-slate-300 no-underline"
                            >
                                Preguntas Frecuentes
                            </a>
                        </li>
                        <li>
                            <a 
                                href="/reclamos-y-devoluciones.pdf" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-brand-yellow transition duration-300 cursor-pointer text-slate-300 no-underline"
                            >
                                Reclamos y Devoluciones
                            </a>
                        </li>
                    </ul>
                </div>

                {/* COLUMNA 4: CONTACTO */}
                <div>
                    <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs border-b border-slate-860 pb-2">Contacto</h3>
                    <ul className="space-y-3 text-xs md:text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin size={16} className="text-brand-yellow shrink-0 mt-0.5" />
                            <span>Concepción del Uruguay, Entre Ríos, Argentina</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={16} className="text-brand-yellow shrink-0" />
                            <a 
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=bloquemundoo@gmail.com" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-brand-yellow transition text-slate-300 no-underline"
                            >
                                bloquemundoo@gmail.com
                            </a>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={16} className="text-brand-yellow shrink-0" />
                            <a href="tel:+5493442000000" className="hover:text-brand-yellow transition text-slate-300 no-underline">+54 9 3442 000000</a>
                        </li>
                    </ul>
                </div>

            </div>

            {/* BARRA INFERIOR */}
            <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-6 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-4">
                <span>Copyright © 2026 Bloque Mundo. Todos los derechos reservados.</span>
                <div className="flex items-center gap-2 pr-16">
                    <span className="font-bold uppercase tracking-wider text-[9px] opacity-70">Desarrollado por</span>
                    <a href="https://www.instagram.com/vexa.systems" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <img src={vexaLogo} alt="Vexa Systems" className="h-10 object-contain hover:scale-105 transition duration-300 brightness-0 invert opacity-70 hover:opacity-100" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;