import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginRequest, verifyUserRequest, registerRequest } from '../api/auth';
import { GoogleLogin } from '@react-oauth/google'; // 🔥 Importamos el botón oficial
import Header from '../components/Header';
import Footer from '../components/Footer';

// IMPORTAMOS TU IMAGEN LOCAL AQUÍ
import bgImage from '../assets/background-lego.jpg';

const Login = () => {
    // Estados para login tradicional
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // 🔥 Estados para el registro de Google (Igual que en el modal)
    const [showExtraFields, setShowExtraFields] = useState(false);
    const [tempUserData, setTempUserData] = useState(null);
    const [extraData, setExtraData] = useState({
        apellido: '',
        direccion: '',
        telefono: ''
    });

    const navigate = useNavigate();
    const { login } = useAuth();

    // Función centralizada para loguear y redirigir
    const handleSuccess = (token) => {
        if (token) login(token);
        navigate('/'); // Nos lleva al inicio al terminar
    };

    // 🔥 MANEJO DEL BOTÓN OFICIAL DE GOOGLE
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Decodificamos el token JWT de Google
            const base64Url = credentialResponse.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const googleUser = JSON.parse(jsonPayload);

            // Verificamos si existe en el backend
            const serverRes = await verifyUserRequest(googleUser.email);

            if (serverRes.exists) {
                // Si existe, lo dejamos pasar
                handleSuccess(serverRes.token);
            } else {
                // Si es nuevo, pedimos los datos
                setTempUserData({
                    given_name: googleUser.given_name,
                    email: googleUser.email
                });
                setShowExtraFields(true);
            }
        } catch (error) {
            console.error("Error procesando Google Login:", error);
            setError("No se pudo conectar con Google.");
        }
    };

    // 🔥 REGISTRO FINAL (Cuando llena el formulario extra)
    const handleFinalRegister = async (e) => {
        e.preventDefault();
        try {
            const fullData = {
                nombre: tempUserData.given_name,
                email: tempUserData.email,
                apellido: extraData.apellido,
                direccion: extraData.direccion,
                telefono: extraData.telefono
            };

            const res = await registerRequest(fullData);
            handleSuccess(res.access_token);
        } catch (err) {
            setError("Error al completar el registro.");
        }
    };

    // LOGIN TRADICIONAL
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await loginRequest(email, password);
            handleSuccess(data.access_token);
        } catch (err) {
            setError("Email o contraseña incorrectos");
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center relative py-16 md:py-24 px-4 min-h-[650px]">

                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{
                        backgroundImage: `url(${bgImage})`
                    }}
                ></div>

                <div className="absolute inset-0 bg-black/40 z-10"></div>

                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-20 animate-fade-in-up border border-slate-150">

                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {showExtraFields ? (
                        /* --- VISTA DE COMPLETAR PERFIL --- */
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">¡Hola {tempUserData?.given_name}!</h2>
                            <p className="text-slate-500 text-center text-sm mb-6">Solo unos pasos más para completar tu perfil de constructor.</p>

                            <form onSubmit={handleFinalRegister} className="space-y-4">
                                <input type="text" placeholder="Tu Apellido" className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm" onChange={(e) => setExtraData({ ...extraData, apellido: e.target.value })} required />
                                <input type="text" placeholder="Dirección de envío (Calle, Altura, Ciudad)" className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm" onChange={(e) => setExtraData({ ...extraData, direccion: e.target.value })} required />
                                <input type="tel" placeholder="Teléfono de contacto" className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm" onChange={(e) => setExtraData({ ...extraData, telefono: e.target.value })} required />
                                <button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg transition uppercase tracking-wider">
                                    Finalizar Registro
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* --- VISTA DE LOGIN NORMAL / GOOGLE --- */
                        <>
                            <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">
                                Iniciar sesión o registrarse
                            </h2>

                            <div className="flex justify-center mb-6">
                                <h1 className="text-7xl font-logo text-brand-red leading-none drop-shadow-sm text-center">
                                    BLOQUE MUNDO
                                </h1>
                            </div>

                            {/* 🔥 EL BOTÓN OFICIAL DE GOOGLE */}
                            <div className="flex justify-center mb-6 w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        setError("El inicio de sesión fue cancelado o bloqueado.");
                                    }}
                                    prompt="select_account" // Forzamos a que pregunte la cuenta
                                />
                            </div>

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
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;