import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { useFavorites } from '../context/FavoritesContext';
import { getProductsRequest } from '../api/products';
import { HeartCrack } from 'lucide-react';
import bgImage from '../assets/background-lego.jpg';

const Favorites = () => {
    const { favoritesIds } = useFavorites();
    const navigate = useNavigate();
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavoriteProducts = async () => {
            try {
                setLoading(true);
                // Traemos todo el catálogo
                const allProducts = await getProductsRequest();

                // Filtramos solo los que su ID está en nuestro array de favoritos
                const filtered = allProducts.filter(p => {
                    const pId = p.id || p.idProducto || p.id_producto;
                    return favoritesIds.some(favId => String(favId) === String(pId));
                });

                setFavoriteProducts(filtered);
            } catch (err) {
                console.error("Error al cargar productos favoritos", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteProducts();
    }, [favoritesIds]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <div className="relative h-64 w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${bgImage})` }}></div>
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <div className="relative z-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Favoritos
                    </h1>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full py-16 px-6">
                {loading ? (
                    <Loader text="Cargando tus favoritos..." />
                ) : favoriteProducts.length === 0 ? (
                    <div className="bg-white rounded-xl p-20 text-center shadow-sm border border-slate-100 flex flex-col items-center">
                        <HeartCrack size={64} className="text-slate-200 mb-6" />
                        <p className="text-2xl font-bold text-slate-400 mb-6">Aún no tenés favoritos guardados</p>
                        <button onClick={() => navigate('/tienda')} className="bg-brand-red text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-red-700 transition">
                            Explorar Tienda
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {favoriteProducts.map((p, index) => (
                            <ProductCard key={index} product={p} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Favorites;