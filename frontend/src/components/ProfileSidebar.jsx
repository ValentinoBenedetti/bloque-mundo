import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './ProfileSidebar.module.css';

import { Link, useLocation } from 'react-router-dom';
import { FiX, FiEdit2, FiPackage, FiLogOut, FiBarChart2, FiLayers, FiUsers } from 'react-icons/fi';

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

                {/* Mostramos el nombre del usuario */}
                {userData?.nombre && (
                    <p className={styles.userName}>Hola, {userData.nombre}</p>
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
                        </ul>
                    </>
                )}
            </div>
        </>
    );
};

export default ProfileSidebar;