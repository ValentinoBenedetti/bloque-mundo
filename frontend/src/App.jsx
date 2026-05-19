import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext'; // <-- IMPORTAMOS
import Login from './pages/Login';
import Home from './pages/Home';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites'; // <-- IMPORTAMOS PÁGINA
import Nosotros from './pages/Nosotros';
import AuthModal from './components/AuthModal';
import EditProfile from './pages/EditProfile';
import MisCompras from './pages/MisCompras';
import ScrollToTopButton from './components/ScrollToTopButton';
import HistorialVentas from './pages/HistorialVentas';
import GestionProductos from './pages/GestionProductos';
import AdminUsuarios from './pages/AdminUsuarios';
import GestionEnvios from './pages/GestionEnvios';

const decodificarToken = (token) => {
  try {
    if (!token) return null;
    if (typeof token === 'object') return token;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/" />;
  
  if (requireAdmin) {
    const userData = decodificarToken(user);
    if (!userData || !userData.esAdmin) {
      return <Navigate to="/" />;
    }
  }
  
  return children;
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider> {/* <-- ENVOLVEMOS */}
          <BrowserRouter>
            <ScrollToTop />
            <AuthModal />
            <ScrollToTopButton />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />
              <Route path="/tienda" element={<Store />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/producto/:id" element={<ProductDetail />} />

              <Route path="/carrito" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} /> {/* <-- RUTA */}
              <Route path="/perfil/editar" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/perfil/compras" element={<ProtectedRoute><MisCompras /></ProtectedRoute>} />
              <Route path="/admin/ventas" element={<ProtectedRoute requireAdmin={true}><HistorialVentas /></ProtectedRoute>} />
              <Route path="/admin/productos" element={<ProtectedRoute requireAdmin={true}><GestionProductos /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute requireAdmin={true}><AdminUsuarios /></ProtectedRoute>} />
              <Route path="/admin/pedidos" element={<ProtectedRoute requireAdmin={true}><GestionEnvios /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;