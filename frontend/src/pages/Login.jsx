import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginRequest } from '../api/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';

// 1. IMPORTAMOS TU IMAGEN LOCAL AQUÍ
import bgImage from '../assets/background-lego.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await loginRequest(email, password);
            localStorage.setItem('token', data.access_token);
            setIsAuthenticated(true);
            navigate('/');
        } catch (err) {
            setError("Email o contraseña incorrectos");
        }
    };

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <Header />

            <main className="flex-1 flex items-center justify-center relative bg-slate-400">

                {/* 2. USAMOS LA IMAGEN IMPORTADA EN EL FONDO */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{
                        backgroundImage: `url(${bgImage})`
                    }}
                ></div>

                <div className="absolute inset-0 bg-black/40 z-10"></div>

                {/* MODAL FIGMA */}
                <div className="bg-white p-8 md:p-10 rounded-lg shadow-2xl w-full max-w-lg relative z-20 mx-4">

                    <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">
                        Iniciar sesión o registrarse
                    </h2>

                    <div className="flex justify-center mb-6">
                        <h1 className="text-7xl font-logo text-brand-red leading-none drop-shadow-sm">
                            BLOQUE MUNDO
                        </h1>
                    </div>

                    <button className="w-full flex items-center justify-center gap-3 border-2 border-slate-900 rounded-lg py-2 px-6 mb-6 hover:bg-slate-50 transition font-bold">
                        <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="h-5 w-5" />
                        Continuar con Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-[10px]"><span className="bg-white px-3 text-slate-400 uppercase tracking-widest font-bold">o usa tu cuenta</span></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && <p className="bg-red-50 text-red-600 p-2 rounded-lg text-xs border border-red-100 text-center">{error}</p>}

                        <input
                            type="email" placeholder="Tu Email"
                            className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm"
                            onChange={(e) => setEmail(e.target.value)} required
                        />
                        <input
                            type="password" placeholder="Tu Contraseña"
                            className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm"
                            onChange={(e) => setPassword(e.target.value)} required
                        />

                        <button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg transition active:scale-[0.98] text-lg uppercase tracking-wider">
                            Entrar con Email
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;