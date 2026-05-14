import vexaLogo from '../assets/vexa-logo.png';

const Footer = () => {
    return (
        <footer className="w-full bg-brand-yellow py-6 px-10 z-20">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-start text-[10px] md:text-xs text-brand-dark gap-8">

                <div className="space-y-2">
                    <h2 className="text-sm font-bold">Bloque Mundo</h2>
                    <p className="opacity-80">Concepcion del Uruguay, Entre Rios, Argentina.</p>
                </div>

                <div className="flex gap-10">
                    <div>
                        <h3 className="font-bold mb-2 underline decoration-1">Links</h3>
                        <ul className="space-y-1 opacity-80">
                            <li>Inicio</li> <li>Tienda</li> <li>Contacto</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2 underline decoration-1">Help</h3>
                        <ul className="space-y-1 opacity-80">
                            <li>Payment Options</li> <li>Returns</li> <li>Privacy Policies</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto border-t border-brand-dark/10 mt-4 pt-4 flex flex-wrap justify-between items-center text-[9px] opacity-80 gap-4">
                <span>Copyright © 2026 Bloque Mundo. All rights reserved.</span>
                <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-[8px] opacity-70">Desarrollado por</span>
                    <a href="https://www.instagram.com/vexa.systems" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <img src={vexaLogo} alt="Vexa Systems" className="h-6 object-contain hover:scale-105 transition duration-300" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;