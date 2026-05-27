import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginRequest, verifyUserRequest, registerRequest } from '../api/auth';
import { GoogleLogin } from '@react-oauth/google';
import Logo from './Logo';

const AuthModal = () => {
    const { isAuthModalOpen, closeAuthModal, login, pendingAction } = useAuth();

    // Estados para login tradicional
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Estados para el registro de Google
    const [showExtraFields, setShowExtraFields] = useState(false);
    const [tempUserData, setTempUserData] = useState(null);
    const [extraData, setExtraData] = useState({
        apellido: '',
        direccion: '',
        telefono: ''
    });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!extraData.direccion || extraData.direccion.length < 3) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(extraData.direccion)}&limit=5&countrycodes=ar`, {
                    headers: {
                        'Accept-Language': 'es',
                        'User-Agent': 'BloqueMundo-App/1.0'
                    }
                });
                const data = await res.json();
                if (data && data.length > 0) {
                    setSuggestions(data.map(d => d.display_name.replace(', Argentina', '')));
                } else {
                    const resLoc = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?nombre=${encodeURIComponent(extraData.direccion)}&max=5`);
                    const dataLoc = await resLoc.json();
                    if (dataLoc.localidades && dataLoc.localidades.length > 0) {
                        setSuggestions(dataLoc.localidades.map(l => `${l.nombre}, ${l.provincia.nombre}`));
                    }
                }
            } catch (err) {
                console.error("Error fetching suggestions", err);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [extraData.direccion]);

    if (!isAuthModalOpen) return null;

    const handleSuccess = (token) => {
        if (token) login(token);
        if (pendingAction) pendingAction();
        closeAuthModal();
        setShowExtraFields(false);
        setTempUserData(null);
    };

    // 🔥 NUEVA FUNCIÓN: Maneja el éxito del BOTÓN OFICIAL
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // 1. Google nos manda un token "JWT". Lo decodificamos para leer el email y el nombre.
            const base64Url = credentialResponse.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const googleUser = JSON.parse(jsonPayload);
            console.log("1. Mail recibido de Google:", googleUser.email);

            // 2. Verificamos en el Backend si el email existe
            const serverRes = await verifyUserRequest(googleUser.email);
            console.log("2. Respuesta del backend:", serverRes);

            if (serverRes.exists) {
                console.log("3. El usuario YA EXISTE. Entrando directo...");
                handleSuccess(serverRes.token);
            } else {
                console.log("3. El usuario ES NUEVO. Pidiendo datos extra...");
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

    const handleLoginTraditional = async (e) => {
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
        <div className="fixed inset-0 z-200 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeAuthModal}></div>

            <div className="bg-white p-8 md:p-10 rounded-lg shadow-2xl w-full max-w-lg relative z-20 mx-4 animate-fade-in-up overflow-visible">

                <button onClick={closeAuthModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {showExtraFields ? (
                    <div className="animate-fade-in overflow-visible">
                        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">¡Hola {tempUserData?.given_name}!</h2>
                        <p className="text-slate-500 text-center text-sm mb-6">Solo unos pasos más para completar tu perfil de constructor.</p>

                        <form onSubmit={handleFinalRegister} className="space-y-4 overflow-visible">
                            <input type="text" placeholder="Tu Apellido" className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm font-medium" onChange={(e) => setExtraData({ ...extraData, apellido: e.target.value })} required />
                            
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={extraData.direccion}
                                    placeholder="Dirección de envío (Calle, Altura, Ciudad)" 
                                    className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm font-medium" 
                                    onChange={(e) => {
                                        setExtraData({ ...extraData, direccion: e.target.value });
                                        setShowSuggestions(true);
                                    }} 
                                    onFocus={() => setShowSuggestions(true)}
                                    required 
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                                        {suggestions.map((s, i) => (
                                            <div 
                                                key={i}
                                                onClick={() => {
                                                    setExtraData(prev => ({ ...prev, direccion: s }));
                                                    setShowSuggestions(false);
                                                }}
                                                className="p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                                            >
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input type="tel" placeholder="Teléfono de contacto" className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm font-medium" onChange={(e) => setExtraData({ ...extraData, telefono: e.target.value })} required />
                            <button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg transition uppercase tracking-wider">
                                Finalizar Registro
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Iniciar sesión o registrarse</h2>

                        <div className="flex justify-center mb-6">
                            <Logo size="large" textOnly={true} animated={false} className="bg-brand-red rounded-xl p-4 shadow-xl border-2 border-brand-red scale-90" />
                        </div>

                        {/* 🔥 EL BOTÓN OFICIAL DE GOOGLE */}
                        <div className="flex flex-col items-center justify-center mb-6 w-full space-y-4">
                            {error && <p className="bg-red-50 text-red-600 p-2 rounded-lg text-xs border border-red-100 text-center w-full">{error}</p>}
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    console.log("Error oficial desde el botón de Google");
                                    setError("El inicio de sesión falló.");
                                }}
                                ux_mode="popup"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthModal;