import { Search, User, Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="bg-brand-red py-4 px-10 flex justify-between items-center shadow-lg sticky top-0 z-50">
            {/* Logo */}
            <h1
                className="text-3xl font-logo text-white tracking-widest cursor-pointer"
                onClick={() => navigate('/')}
            >
                Bloque Mundo
            </h1>

            {/* Links Centrales */}
            <div className="hidden md:flex gap-10 text-white font-medium text-sm tracking-tight">
                <button onClick={() => navigate('/')} className="hover:opacity-80 transition cursor-pointer">Inicio</button>
                <button onClick={() => navigate('/tienda')} className="hover:opacity-80 transition cursor-pointer">Tienda</button>
                <button className="hover:opacity-80 transition cursor-pointer">Nosotros</button>
            </div>

            {/* Iconos Derecha */}
            <div className="flex gap-6 text-white items-center">
                <Search size={20} className="cursor-pointer hover:scale-110 transition" />
                <User size={20} className="cursor-pointer hover:scale-110 transition" onClick={() => navigate('/perfil')} />
                <Heart size={20} className="cursor-pointer hover:scale-110 transition" />
                <ShoppingCart size={20} className="cursor-pointer hover:scale-110 transition" />
            </div>
        </nav>
    );
};

export default Navbar;