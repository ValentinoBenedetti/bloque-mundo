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
import AuthModal from './components/AuthModal';
import EditProfile from './pages/EditProfile';
import MisCompras from './pages/MisCompras';

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
              <Route path="/producto/:id" element={<ProductDetail />} />

              <Route path="/carrito" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} /> {/* <-- RUTA */}
              <Route path="/perfil/editar" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/perfil/compras" element={<ProtectedRoute><MisCompras /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;