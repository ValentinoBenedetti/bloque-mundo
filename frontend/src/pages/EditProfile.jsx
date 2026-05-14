import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getUserRequest, updateUserRequest } from '../api/users';
import { getUserStatusRequest } from '../api/usuarios';
import bgImage from '../assets/background-lego.jpg';

const decodificarToken = (token) => {
    try {
        if (!token) return null;
        if (typeof token === 'object') return token;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const EditProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        nombre: '',
        apellido: '',
        direccion: '',
        telefono: '',
    });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const tokenData = decodificarToken(user);
    const userId = tokenData?.sub || tokenData?.idUsuario;
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const fetchUser = async () => {
            try {
                const data = await getUserRequest(userId);
                setUserData({
                    nombre: data.nombre || '',
                    apellido: data.apellido || '',
                    direccion: data.direccion || '',
                    telefono: data.telefono || '',
                });
                setOriginalData(data);
                
                const statusData = await getUserStatusRequest(userId);
                setStatus(statusData);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar los datos del perfil.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, navigate]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!userData.direccion || userData.direccion.length < 3) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userData.direccion)}&limit=5&countrycodes=ar`, {
                    headers: {
                        'Accept-Language': 'es',
                        'User-Agent': 'BloqueMundo-App/1.0'
                    }
                });
                const data = await res.json();
                if (data && data.length > 0) {
                    setSuggestions(data.map(d => d.display_name.replace(', Argentina', '')));
                } else {
                    const resLoc = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?nombre=${encodeURIComponent(userData.direccion)}&max=5`);
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
    }, [userData.direccion]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await updateUserRequest(userId, userData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            setError('Error al guardar los cambios.');
        } finally {
            setSaving(false);
        }
    };

    const nivelID = status?.nivelActual?.idNivel || originalData?.nivel?.idNivel || originalData?.idNivel || 1;
    const nivelNumero = nivelID >= 6 ? nivelID - 5 : nivelID;
    const nivelNombre = status?.nivelActual?.nombre || originalData?.nivel?.nombre || "Aprendiz";
    const nivelUsuario = `${nivelNumero} - ${nivelNombre}`;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            
            <section className="relative h-[250px] bg-slate-900 flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <img
                    src={bgImage}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    alt="Banner"
                />
                <div className="relative z-20 text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Editar mi perfil</h1>
                    <p className="text-sm font-medium tracking-widest uppercase opacity-80">
                        Inicio <span className="mx-2">&gt;</span> Editar mi perfil
                    </p>
                </div>
            </section>

            <main className="flex-1 max-w-3xl w-full mx-auto py-12 px-6 animate-fade-in-up">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-red"></div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center gap-16 sm:gap-32 mb-10 text-center">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 mb-1">ID de usuario</h3>
                                <p className="text-3xl font-black text-slate-900">{userId}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 mb-1">Tu nivel de usuario</h3>
                                <p className="text-3xl font-black text-slate-900">{nivelUsuario}</p>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm">
                            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center">{error}</div>}
                            {success && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm font-medium text-center">¡Perfil actualizado con éxito!</div>}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={userData.nombre}
                                            onChange={handleChange}
                                            placeholder="Nombre"
                                            className="w-full p-3 pr-10 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm text-slate-800 font-medium"
                                        />
                                        <Pencil size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Apellido</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={userData.apellido}
                                            onChange={handleChange}
                                            placeholder="Apellido"
                                            className="w-full p-3 pr-10 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm text-slate-800 font-medium"
                                        />
                                        <Pencil size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Dirección</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={userData.direccion}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            placeholder="Ingrese su dirección"
                                            className="w-full p-3 pr-10 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm text-slate-800 font-medium"
                                        />
                                        <Pencil size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>

                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                            {suggestions.map((s, i) => (
                                                <div 
                                                    key={i}
                                                    onClick={() => {
                                                        setUserData(prev => ({ ...prev, direccion: s }));
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

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={userData.telefono}
                                            onChange={handleChange}
                                            placeholder="Ingrese su teléfono"
                                            className="w-full p-3 pr-10 border-2 border-slate-100 rounded-lg focus:border-brand-red outline-none transition text-sm text-slate-800 font-medium"
                                        />
                                        <Pencil size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="flex-1 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold py-3 rounded-lg transition uppercase tracking-widest text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-bold py-3 rounded-lg shadow-sm transition disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest text-sm"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                                Guardando...
                                            </>
                                        ) : (
                                            'Guardar cambios'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default EditProfile;
