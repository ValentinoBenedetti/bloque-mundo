import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import HistorialVentas from './pages/HistorialVentas';
import GestionProductos from './pages/GestionProductos';
import AdminUsuarios from './pages/AdminUsuarios';
import GestionPedidos from './pages/GestionPedidos';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider> {/* <-- ENVOLVEMOS */}
          <BrowserRouter>
            <AuthModal />
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
              <Route path="/admin/ventas" element={<ProtectedRoute><HistorialVentas /></ProtectedRoute>} />
              <Route path="/admin/productos" element={<ProtectedRoute><GestionProductos /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute><AdminUsuarios /></ProtectedRoute>} />
              <Route path="/admin/pedidos" element={<ProtectedRoute><GestionPedidos /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;