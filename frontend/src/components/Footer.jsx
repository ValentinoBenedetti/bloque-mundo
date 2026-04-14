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
            <div className="max-w-7xl mx-auto border-t border-brand-dark/10 mt-4 pt-4 text-[9px] opacity-60">
                Copyright © 2025 Bloque Mundo. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;