import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import logoMercadoPago from '../assets/logo mercado pago byn.png';

const Cart = () => {
    const { cart, addToCart, removeFromCart, totalPrice, cartMetadata } = useCart();
    const navigate = useNavigate();

    // ESTADO PARA EL MODAL DE CONFIRMACI"N
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        product: null,
        action: null
    });
    const [coupon, setCoupon] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (shippingAddress.length < 3) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?nombre=${shippingAddress}&max=5`);
                const data = await res.json();
                if (data.localidades) {
                    setSuggestions(data.localidades.map(l => `${l.nombre}, ${l.provincia.nombre}`));
                }
            } catch (err) {
                console.error("Error fetching suggestions", err);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [shippingAddress]);

    const formatPrice = (p) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(p || 0);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-6">
                <button
                    onClick={() => navigate('/tienda')}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-red transition mb-8 font-bold text-sm"
                >
                    <ArrowLeft size={18} /> Continuar comprando
                </button>

                <h1 className="text-4xl font-black text-slate-900 uppercase italic mb-10 tracking-tighter">Mi Carrito</h1>

                {cart.length === 0 ? (
                    <div className="bg-white rounded-xl p-20 text-center shadow-sm border border-slate-100">
                        <p className="text-2xl font-bold text-slate-400 mb-6">Tu carrito está vacío 🧱</p>
                        <button
                            onClick={() => navigate('/tienda')}
                            className="bg-brand-red text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-red-700 transition"
                        >
                            Ir a la tienda
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* LISTA DE PRODUCTOS (Izquierda) */}
                        <div className="flex-1 space-y-4">
                            {cart.map((item, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-6">
                                    <div className="w-24 h-24 bg-slate-50 rounded-lg p-2 shrink-0">
                                        <img
                                            src={item.imagen || item.imagenes || item.image}
                                            className="w-full h-full object-contain mix-blend-multiply"
                                            alt="producto"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 uppercase italic">
                                            {item.titulo || item.nombre}
                                        </h3>
                                        <p className="text-brand-red font-black text-sm mb-4">
                                            {formatPrice(item.precio || item.price)} c/u
                                        </p>

                                        <div className="flex items-center border-2 border-slate-100 rounded-lg w-max">
                                            <button
                                                onClick={() => {
                                                    if (item.quantity === 1) {
                                                        setConfirmModal({
                                                            isOpen: true,
                                                            product: item,
                                                            action: 'minus'
                                                        });
                                                    } else {
                                                        addToCart(item, -1);
                                                    }
                                                }}
                                                className="px-3 py-1 text-slate-400 hover:text-slate-900 transition"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="px-4 font-black text-slate-800">{item.quantity}</span>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await addToCart(item, 1);
                                                    } catch (err) {
                                                        alert(err.message || "Error al actualizar la cantidad");
                                                    }
                                                }}
                                                className="px-3 py-1 text-slate-400 hover:text-slate-900 transition"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xl font-black text-slate-900 mb-4">
                                            {formatPrice((item.precio || item.price) * item.quantity)}
                                        </p>
                                        <button
                                            onClick={() => {
                                                setConfirmModal({
                                                    isOpen: true,
                                                    product: item,
                                                    action: 'remove'
                                                });
                                            }}
                                            className="text-slate-300 hover:text-brand-red transition p-2"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RESUMEN DE COMPRA (Derecha) */}
                        <div className="lg:w-96">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 sticky top-28">
                                <h2 className="text-xl font-black text-slate-900 uppercase italic mb-6 border-b-2 border-brand-yellow pb-2">
                                    Total carrito
                                </h2>

                                {/* Cupon de Descuento */}
                                <div className="mb-6 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cupón de descuento</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={coupon}
                                            onChange={(e) => setCoupon(e.target.value)}
                                            placeholder="Ingresa tu cupón (opcional)"
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand-red transition"
                                        />
                                    </div>
                                </div>

                                {/* Dirección de Envío */}
                                <div className="mb-8 space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección de envío</label>
                                    <input 
                                        type="text" 
                                        value={shippingAddress}
                                        onChange={(e) => {
                                            setShippingAddress(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Calle, Número, Ciudad y CP"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-brand-red transition"
                                    />
                                    
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl z-50 overflow-hidden">
                                            {suggestions.map((s, i) => (
                                                <div 
                                                    key={i}
                                                    onClick={() => {
                                                        setShippingAddress(s);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-[9px] text-slate-400 italic">
                                        Si no sabes tu CP, ingresa solo la Ciudad.
                                    </p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-slate-500 font-bold text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(cartMetadata.total)}</span>
                                    </div>
                                    
                                    {cartMetadata.descuentoAplicado > 0 && (
                                        <div className="flex justify-between text-brand-red font-black text-sm items-center">
                                            <div className="flex flex-col">
                                                <span>Descuento</span>
                                                <span className="text-[9px] uppercase tracking-tighter opacity-70">
                                                    Por ser Nivel {cartMetadata.usuario?.nivel?.nombre}
                                                </span>
                                            </div>
                                            <span>-{formatPrice(cartMetadata.descuentoAplicado)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-slate-500 font-bold text-sm">
                                        <span>Envío</span>
                                        <span className="text-green-500">Gratis</span>
                                    </div>

                                    <div className="h-1px bg-slate-100 my-4"></div>
                                    
                                    <div className="flex justify-between text-2xl font-black text-slate-900">
                                        <span>Total</span>
                                        <span>{formatPrice(cartMetadata.totalConDescuento)}</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-slate-900 text-white font-black py-4 rounded-lg shadow-lg hover:bg-black transition-all uppercase tracking-widest text-sm italic mb-6"
                                >
                                    Pagar con Mercado Pago
                                </button>
                                
                                <div className="flex flex-col items-center gap-4">
                                    <img 
                                        src={logoMercadoPago} 
                                        alt="Mercado Pago" 
                                        className="h-8 brightness-0 opacity-80"
                                    />
                                    <p className="text-[10px] text-slate-400 text-center font-medium italic max-w-[200px] leading-tight">
                                        Operamos exclusivamente con Mercado Pago para garantizar la seguridad de tus transacciones.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>

            <Footer />

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={() => {
                    if (confirmModal.action === 'remove') {
                        removeFromCart(confirmModal.product.id || confirmModal.product.idProducto || confirmModal.product.id_producto);
                    } else {
                        addToCart(confirmModal.product, -1);
                    }
                }}
                title="¿Eliminar producto?"
                message={`¿Estás seguro que deseas eliminar "${confirmModal.product?.titulo || confirmModal.product?.nombre}" del carrito?`}
            />
        </div>
    );
};

export default Cart;