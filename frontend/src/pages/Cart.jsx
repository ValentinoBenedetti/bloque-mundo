import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { crearPreferenciaRequest, confirmarCompraRequest } from '../api/pedidos';
import ConfirmModal from '../components/ConfirmModal';
import logoMercadoPago from '../assets/logo mercado pago byn.png';
import Swal from 'sweetalert2';

const extraerCP = (direccion) => {
    if (!direccion) return '0000';
    const cpMatch = direccion.match(/(?:CP|C\.P\.)\s*([A-Z]?\d{4}[A-Z]{0,3})/i);
    if (cpMatch) {
        const digits = cpMatch[1].match(/(\d{4})/);
        return digits ? digits[1] : cpMatch[1];
    }
    const endMatch = direccion.match(/,\s*([A-Z]?\d{4}[A-Z]{0,3})\s*$/i);
    if (endMatch) {
        const digits = endMatch[1].match(/(\d{4})/);
        return digits ? digits[1] : endMatch[1];
    }
    const generalMatch = direccion.match(/\b\d{4}\b/);
    if (generalMatch) {
        return generalMatch[0];
    }
    return '0000';
};

const calcularCostoEnvio = (cp) => {
    if (!cp || cp === '0000') return 1500;
    const cpNumerico = cp.replace(/\D/g, '');
    if (cpNumerico === '3260') {
        return 0;
    }
    const cpInt = parseInt(cpNumerico, 10);
    if (isNaN(cpInt) || cpNumerico.length !== 4) {
        return 1500;
    }
    if (cpNumerico.startsWith('31') || cpNumerico.startsWith('32')) {
        return 800; // Entre Ríos
    }
    if (cpNumerico.startsWith('3')) {
        return 1200; // Litoral / Norte
    }
    if (cpNumerico.startsWith('1') || cpNumerico.startsWith('2')) {
        return 1500; // Buenos Aires y CABA
    }
    if (cpNumerico.startsWith('4') || cpNumerico.startsWith('5')) {
        return 2000; // Centro / Cuyo / NOA
    }
    if (cpNumerico.startsWith('8') || cpNumerico.startsWith('9')) {
        return 2800; // Patagonia
    }
    return 1500;
};

const Cart = () => {
    const { cart, addToCart, removeFromCart, refreshCart, totalPrice, cartMetadata, setStockError } = useCart();
    const navigate = useNavigate();

    // ESTADO PARA EL MODAL DE CONFIRMACI"N
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        product: null,
        action: null
    });
    const [coupon, setCoupon] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [priceChanges, setPriceChanges] = useState({});

    const userSavedAddress = cartMetadata?.usuario?.direccion || '';
    const [useSavedAddress, setUseSavedAddress] = useState(true);

    useEffect(() => {
        if (useSavedAddress && userSavedAddress) {
            setShippingAddress(userSavedAddress);
        } else if (!useSavedAddress && shippingAddress === userSavedAddress) {
            setShippingAddress('');
        }
    }, [useSavedAddress, userSavedAddress]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (shippingAddress.length < 3) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(shippingAddress)}&limit=5&countrycodes=ar`, {
                    headers: {
                        'Accept-Language': 'es',
                        'User-Agent': 'BloqueMundo-App/1.0'
                    }
                });
                const data = await res.json();
                if (data && data.length > 0) {
                    setSuggestions(data.map(d => d.display_name.replace(', Argentina', '')));
                } else {
                    const resLoc = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?nombre=${encodeURIComponent(shippingAddress)}&max=5`);
                    const dataLoc = await resLoc.json();
                    if (dataLoc.localidades && dataLoc.localidades.length > 0) {
                        setSuggestions(dataLoc.localidades.map(l => `${l.nombre}, ${l.provincia.nombre}`));
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        const timer = setTimeout(() => {
            fetchSuggestions();
        }, 300);
        return () => clearTimeout(timer);
    }, [shippingAddress]);

    const formatPrice = (p) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(p || 0);

    const handleApplyCoupon = async () => {
        if (!coupon.trim()) return;

        setValidatingCoupon(true);
        setCouponError('');

        try {
            // Recopilar los IDs de todos los temas en el carrito para validación
            const temasEnCarrito = cart.reduce((acc, item) => {
                if (item.tema?.idTema) acc.push(item.tema.idTema);
                if (item.productos && Array.isArray(item.productos)) {
                    item.productos.forEach(prod => {
                        if (prod.tema?.idTema) acc.push(prod.tema.idTema);
                    });
                }
                return acc;
            }, []);

            const res = await fetch('http://localhost:3000/cupones/validar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo: coupon.trim(),
                    subtotal: cartMetadata.total,
                    temasEnCarrito,
                    idUsuario: cartMetadata?.usuario?.idUsuario ?? undefined
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Cupón no válido');
            }

            setAppliedCoupon(data);
        } catch (err) {
            setCouponError(err.message);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleCheckout = async () => {
        if (!shippingAddress.trim()) {
            return setCouponError('Debes ingresar una dirección de envío.');
        }

        try {
            setLoadingCheckout(true);
            setCouponError(''); // Limpiar errores
            
            // Llama a la API para crear la preferencia pasándole el código del cupón (si lo hay) y la dirección de envío
            const requestData = {
                ...(appliedCoupon ? { codigoCupon: appliedCoupon.codigo } : {}),
                direccionEnvio: shippingAddress.trim()
            };
            
            // Guardar el cupón en localStorage para poder aplicarlo a la vuelta de Mercado Pago
            if (appliedCoupon) {
                localStorage.setItem('tempCuponCheckout', appliedCoupon.codigo);
            } else {
                localStorage.removeItem('tempCuponCheckout');
            }

            // Guardar nivel actual para saber si sube de nivel al confirmar la compra
            if (cartMetadata?.usuario?.nivel) {
                localStorage.setItem('prevUserLevel', JSON.stringify(cartMetadata.usuario.nivel));
            } else {
                localStorage.removeItem('prevUserLevel');
            }

            const { init_point } = await crearPreferenciaRequest(requestData);
            
            // Redirige al checkout de Mercado Pago
            window.location.href = init_point;
        } catch (error) {
            console.error(error);
            const errorPayload = error.data || {};

            if (errorPayload.errorType === 'PRICE_ERROR') {
                setPriceChanges(prev => ({
                    ...prev,
                    [errorPayload.productoId]: { oldPrice: errorPayload.oldPrice, newPrice: errorPayload.newPrice }
                }));
                await refreshCart();

                const result = await Swal.fire({
                    icon: 'info',
                    title: 'Precio Actualizado',
                    text: `Antes de continuar, te avisamos que el precio del producto "${errorPayload.titulo || 'seleccionado'}" fue actualizado.`,
                    showCancelButton: true,
                    confirmButtonText: 'Comprar igualmente',
                    cancelButtonText: 'Ver carrito',
                    confirmButtonColor: '#0f172a',
                    cancelButtonColor: '#64748b'
                });

                if (result.isConfirmed) {
                    handleCheckout();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No pudimos procesar tu compra',
                    text: error.message || 'No se pudo inicializar Mercado Pago. Intenta nuevamente.',
                    confirmButtonColor: '#dc2626'
                }).then(async () => {
                    if (errorPayload.errorType === 'STOCK_ERROR') {
                        // Buscar el item del carrito que contiene este producto (directo o dentro de un combo)
                        const itemToRemove = cart.find(item => {
                            if (String(item.idProducto) === String(errorPayload.productoId)) {
                                return true;
                            }
                            if (item.esCombo && item.productos) {
                                return item.productos.some(p => String(p.idProducto) === String(errorPayload.productoId));
                            }
                            return false;
                        });

                        if (itemToRemove) {
                            if (errorPayload.stockActual <= 0 || itemToRemove.esCombo) {
                                await removeFromCart(itemToRemove.idProducto);
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Carrito actualizado',
                                    text: `El ${itemToRemove.esCombo ? 'combo' : 'producto'} "${itemToRemove.titulo || 'seleccionado'}" ha sido eliminado del carrito por falta de stock.`,
                                    confirmButtonColor: '#0f172a'
                                });
                            } else {
                                const delta = errorPayload.stockActual - errorPayload.solicitada;
                                await addToCart(itemToRemove, delta);
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Cantidad ajustada',
                                    text: `La cantidad de "${itemToRemove.titulo}" fue ajustada al stock disponible (${errorPayload.stockActual} unidades).`,
                                    confirmButtonColor: '#0f172a'
                                });
                            }
                        }
                    }
                });
            }
        } finally {
            setLoadingCheckout(false);
        }
    };

    const subtotal = cartMetadata.total;
    const descuentoNivel = cartMetadata.descuentoAplicado;
    const baseParaCupon = cartMetadata.totalConDescuento;
    const porcentajeCupon = appliedCoupon ? Number(appliedCoupon.porcentaje) : 0;
    const descuentoCupon = baseParaCupon * (porcentajeCupon / 100);
    const totalFinal = baseParaCupon - descuentoCupon;

    // Calcular costo de envío dinámico
    const activeAddress = useSavedAddress ? userSavedAddress : shippingAddress;
    const cpEnvio = extraerCP(activeAddress);
    const costoEnvio = useSavedAddress ? calcularCostoEnvio(cpEnvio) : (shippingAddress.trim() ? calcularCostoEnvio(cpEnvio) : 0);
    const totalFinalConEnvio = totalFinal + costoEnvio;

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
                                        
                                        {priceChanges[item.idProducto || item.id_producto || item.id] ? (
                                            <div className="flex flex-col mb-4">
                                                <span className="text-slate-400 font-bold text-sm line-through">
                                                    {formatPrice(priceChanges[item.idProducto || item.id_producto || item.id].oldPrice)} c/u
                                                </span>
                                                <span className="text-brand-red font-black text-sm">
                                                    {formatPrice(priceChanges[item.idProducto || item.id_producto || item.id].newPrice)} c/u
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-brand-red font-black text-sm mb-4">
                                                {formatPrice(item.precioUnitario || item.precio || item.price)} c/u
                                            </p>
                                        )}

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
                                                        setStockError(err.message || "No hay suficiente stock");
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
                                            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                            placeholder="Ingresa tu cupón"
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand-red font-bold uppercase transition"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={validatingCoupon || !coupon.trim()}
                                            className="bg-slate-900 text-white px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-brand-red transition disabled:opacity-50 shrink-0 cursor-pointer"
                                        >
                                            {validatingCoupon ? '...' : 'Aplicar'}
                                        </button>
                                    </div>
                                    
                                    {couponError && (
                                        <p className="text-xs font-bold text-brand-red italic pt-1">{couponError}</p>
                                    )}

                                    {appliedCoupon && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex flex-col mt-2">
                                            <div className="flex justify-between items-center text-xs font-black text-green-800">
                                                <span>CUPÓN {appliedCoupon.codigo} APLICADO</span>
                                                <span>-{appliedCoupon.porcentaje}%</span>
                                            </div>
                                            {appliedCoupon.condicion && (
                                                <span className="text-[10px] text-green-700 italic mt-1">{appliedCoupon.condicion}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Dirección de Envío */}
                                <div className="mb-8 space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección de envío</label>
                                    
                                    {userSavedAddress && (
                                        <div className="mb-3 space-y-2">
                                            <label className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition ${useSavedAddress ? 'border-brand-red bg-red-50/50' : 'border-slate-200 bg-slate-50 hover:border-brand-red'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="addressType"
                                                    checked={useSavedAddress} 
                                                    onChange={() => setUseSavedAddress(true)}
                                                    className="accent-brand-red w-4 h-4 shrink-0"
                                                />
                                                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                                    <span className="text-xs font-bold text-slate-700 leading-tight">Usar mi dirección guardada</span>
                                                    <span className="text-[11px] text-slate-500 truncate mt-0.5" title={userSavedAddress}>{userSavedAddress}</span>
                                                </div>
                                            </label>

                                            <label className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition ${!useSavedAddress ? 'border-brand-red bg-red-50/50' : 'border-slate-200 bg-slate-50 hover:border-brand-red'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="addressType"
                                                    checked={!useSavedAddress} 
                                                    onChange={() => setUseSavedAddress(false)}
                                                    className="accent-brand-red w-4 h-4"
                                                />
                                                <span className="text-xs font-bold text-slate-700 leading-tight">Usar otra dirección temporal</span>
                                            </label>
                                        </div>
                                    )}

                                    {(!userSavedAddress || !useSavedAddress) && (
                                        <>
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

                                            <p className="text-[9px] text-slate-400 italic mt-2">
                                                Si no sabes tu CP, ingresa solo la Ciudad.
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-slate-500 font-bold text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    
                                    {descuentoNivel > 0 && (
                                        <div className="flex justify-between text-brand-red font-black text-sm items-center">
                                            <div className="flex flex-col">
                                                <span>Descuento</span>
                                                <span className="text-[9px] uppercase tracking-tighter opacity-70">
                                                    Por ser Nivel {cartMetadata.usuario?.nivel?.nombre}
                                                </span>
                                            </div>
                                            <span>-{formatPrice(descuentoNivel)}</span>
                                        </div>
                                    )}

                                    {appliedCoupon && (
                                        <div className="flex justify-between text-green-600 font-black text-sm items-center">
                                            <div className="flex flex-col">
                                                <span>Cupón ({appliedCoupon.codigo})</span>
                                                <span className="text-[9px] uppercase tracking-tighter opacity-70">
                                                    -{appliedCoupon.porcentaje}%
                                                </span>
                                            </div>
                                            <span>-{formatPrice(descuentoCupon)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-slate-500 font-bold text-sm">
                                        <span>Envío</span>
                                        {costoEnvio === 0 ? (
                                            <span className="text-green-500 font-black">Gratis</span>
                                        ) : (
                                            <span>{formatPrice(costoEnvio)}</span>
                                        )}
                                    </div>

                                    <div className="h-1px bg-slate-100 my-4"></div>
                                    
                                    <div className="flex justify-between text-2xl font-black text-slate-900">
                                        <span>Total</span>
                                        <span>{formatPrice(totalFinalConEnvio)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loadingCheckout}
                                    className="w-full bg-slate-900 text-white font-black py-4 rounded-lg shadow-lg hover:bg-black transition-all uppercase tracking-widest text-sm italic mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingCheckout ? 'Procesando...' : 'Pagar con Mercado Pago'}
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