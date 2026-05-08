import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronRight } from 'lucide-react';
import { FaWhatsapp, FaEnvelope, FaInstagram, FaFacebook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Nosotros = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Banner Top */}
            <section className="relative h-[250px] md:h-[350px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1518331647614-7a1f04cd34ce?q=80&w=1920&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105"
                    alt="Lego Background"
                />
                <div className="relative z-20 text-center mt-6">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 drop-shadow-lg">Nosotros</h1>
                    <div className="flex items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-300 gap-2">
                        <span className="cursor-pointer hover:text-white transition" onClick={() => navigate('/')}>Inicio</span>
                        <ChevronRight size={14} />
                        <span className="text-white">Nosotros</span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto w-full py-20 px-6 grow">

                {/* Sección 1: Quiénes somos */}
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 mb-24">
                    <div className="flex-1 space-y-5">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">¿Quiénes somos?</h2>
                        <h3 className="text-base font-medium text-slate-400">Una comunidad que construye algo más que bloques.</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            En Bloque Mundo creemos que cada pieza tiene una historia. Nacimos en Argentina con la idea de reunir en un solo lugar los mejores sets LEGO, minifiguras y accesorios coleccionables. Amamos el diseño, la creatividad y la nostalgia de armar algo con tus propias manos.<br /><br />
                            Por eso cuidamos cada detalle: desde el empaquetado hasta la atención personalizada.
                        </p>
                    </div>
                    <div className="flex-1 w-full">
                        <img
                            src="https://images.unsplash.com/photo-1611002214172-1082ceb03516?q=80&w=800&auto=format&fit=crop"
                            alt="Tienda LEGO"
                            className="rounded-2xl shadow-2xl w-full h-[320px] object-cover transform hover:scale-105 transition duration-500"
                        />
                    </div>
                </div>

                {/* Sección 2: Nuestra misión */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20 mb-28">
                    <div className="flex-1 space-y-5">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nuestra misión</h2>
                        <h3 className="text-base font-medium text-slate-400">Hacer que construir sea parte de cada historia.</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            Nuestro objetivo es acercar el universo LEGO a fans de todas las edades, ofreciendo productos originales, combos exclusivos y envíos a todo el país. Queremos inspirar la imaginación, fomentar la creatividad y mantener viva la pasión por construir.<br /><br />
                            Cada cliente forma parte de esta comunidad, y juntos seguimos creando un mundo hecho de ideas.
                        </p>
                    </div>
                    <div className="flex-1 w-full">
                        <img
                            src="https://images.unsplash.com/photo-1587304193504-20a7b4526017?q=80&w=800&auto=format&fit=crop"
                            alt="Colección LEGO"
                            className="rounded-2xl shadow-2xl w-full h-[320px] object-cover transform hover:scale-105 transition duration-500"
                        />
                    </div>
                </div>

                {/* Botones de Contacto y Redes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
                    <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 px-6 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:text-green-600 transition group text-slate-800 font-bold shadow-sm hover:shadow-md bg-white">
                        <FaWhatsapp size={22} className="text-slate-400 group-hover:text-green-500 transition" />
                        Contactanos por WhatsApp
                    </a>

                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=bloquemundoo@gmail.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 px-6 border-2 border-slate-200 rounded-xl hover:border-brand-red hover:text-brand-red transition group text-slate-800 font-bold shadow-sm hover:shadow-md bg-white">
                        <FaEnvelope size={22} className="text-slate-400 group-hover:text-brand-red transition" />
                        Contactanos por Mail
                    </a>

                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 px-6 border-2 border-slate-200 rounded-xl hover:border-pink-600 hover:text-pink-600 transition group text-slate-800 font-bold shadow-sm hover:shadow-md bg-white">
                        <FaInstagram size={22} className="text-slate-400 group-hover:text-pink-600 transition" />
                        Seguinos en Instagram
                    </a>

                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 px-6 border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:text-blue-600 transition group text-slate-800 font-bold shadow-sm hover:shadow-md bg-white">
                        <FaFacebook size={22} className="text-slate-400 group-hover:text-blue-600 transition" />
                        Seguinos en Facebook
                    </a>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default Nosotros;
