import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './ProfileSidebar.module.css';

import { Link, useLocation } from 'react-router-dom';
import { FiX, FiEdit2, FiPackage, FiLogOut, FiBarChart2, FiLayers, FiUsers, FiAward } from 'react-icons/fi';
import { getUserStatusRequest } from '../api/usuarios';

// 🔥 ESTA ES LA MAGIA: Función que "traduce" el token de seguridad
const decodificarToken = (token) => {
    try {
        if (!token) return null;
        // Si por algún motivo ya es un objeto, lo devolvemos tal cual
        if (typeof token === 'object') return token;

        // Si es el texto largo (JWT), lo abrimos y sacamos la info
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

const ProfileSidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Extraemos tus datos reales del token
    const userData = decodificarToken(user);

    const [status, setStatus] = React.useState(null);

    const userId = userData?.sub || userData?.idUsuario;

    useEffect(() => {
        if (isOpen && userId) {
            const fetchStatus = async () => {
                try {
                    const data = await getUserStatusRequest(userId);
                    setStatus(data);
                } catch (error) {
                    console.error("Error fetching user status:", error);
                }
            };
            fetchStatus();
        }
    }, [isOpen, userId]);

    // Cerrar el panel apretando ESC
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27 && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <>
            {/* Fondo oscuro para tapar el resto de la página */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.isOpen : ''}`}
                onClick={onClose}
            ></div>

            {/* Panel blanco que entra por la derecha */}
            <div className={`${styles.sidebar} ${isOpen ? styles.isOpen : ''}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Mi Perfil</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {userData?.nombre && (
                    <div className="px-6 mb-6">
                        <p className={styles.userName}>Hola, {userData.nombre}</p>
                        
                        {status && (
                            <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-brand-yellow p-1.5 rounded-lg">
                                        <FiAward className="text-slate-900" size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Nivel Actual</span>
                                        <span className="text-sm font-black text-slate-800 uppercase italic leading-none mt-1">
                                            {((nombre) => {
                                                switch (nombre?.toLowerCase()) {
                                                    case 'aprendiz': return 1;
                                                    case 'constructor': return 2;
                                                    case 'arquitecto': return 3;
                                                    case 'experto': return 4;
                                                    case 'maestro': return 5;
                                                    default: return 1;
                                                }
                                            })(status.nivelActual?.nombre)} - {status.nivelActual?.nombre}
                                        </span>
                                    </div>
                                </div>

                                {status.proximoNivel && (
                                    <>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                                            <div 
                                                className="h-full bg-brand-red transition-all duration-1000" 
                                                style={{
                                                    width: `${Math.min(100, Math.max(0, 
                                                        ((status.gastoTotal - parseFloat(status.nivelActual?.montoMinimo || 0)) / 
                                                        (parseFloat(status.proximoNivel.montoMinimo) - parseFloat(status.nivelActual?.montoMinimo || 0))) * 100
                                                    ))}%`
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500">
                                            Te faltan <span className="text-brand-red">${status.faltanteParaProximo.toLocaleString()}</span> para el nivel {status.proximoNivel.nombre}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* VISTA USUARIO NORMAL */}
                <h3 className={styles.sectionTitle}>Acciones de Usuario</h3>
                <ul className={styles.menuList}>
                    <li>
                        <Link to="/perfil/editar" className={`${styles.menuItem} ${location.pathname === '/perfil/editar' ? styles.active : ''}`} onClick={onClose}>
                            <FiEdit2 className={styles.icon} /> Editar mi perfil
                        </Link>
                    </li>
                    <li>
                        <Link to="/perfil/compras" className={`${styles.menuItem} ${location.pathname === '/perfil/compras' ? styles.active : ''}`} onClick={onClose}>
                            <FiPackage className={styles.icon} /> Mis compras
                        </Link>
                    </li>
                    <li>
                        <button onClick={handleLogout} className={styles.menuItem}>
                            <FiLogOut className={styles.icon} /> Cerrar sesión
                        </button>
                    </li>
                </ul>

                {/* VISTA ADMINISTRADOR (Leemos del userData ya decodificado) */}
                {userData?.esAdmin && (
                    <>
                        <hr className={styles.divider} />
                        <h3 className={styles.sectionTitle}>Administración</h3>
                        <ul className={styles.menuList}>
                            <li>
                                <Link to="/admin/ventas" className={styles.menuItem} onClick={onClose}>
                                    <FiBarChart2 className={styles.icon} /> Historial de ventas
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/productos" className={styles.menuItem} onClick={onClose}>
                                    <FiLayers className={styles.icon} /> Gestionar productos
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/usuarios" className={styles.menuItem} onClick={onClose}>
                                    <FiUsers className={styles.icon} /> Administrar usuarios
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/pedidos" className={styles.menuItem} onClick={onClose}>
                                    <FiPackage className={styles.icon} /> Gestión de envíos
                                </Link>
                            </li>
                        </ul>
                    </>
                )}
            </div>
        </>
    );
};

export default ProfileSidebar;