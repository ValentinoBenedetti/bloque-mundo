import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Edit, CheckCircle, Circle, ChevronDown, ChevronUp, Layers, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductModal from '../components/ProductModal';
import ConfirmModal from '../components/ConfirmModal';
import ComboModal from '../components/ComboModal';
import CuponModal from '../components/CuponModal';
import { getProductsRequest, updateProductRequest, deleteProductRequest, createProductRequest } from '../api/products';
import { getCombosRequest, createComboRequest, updateComboRequest, deleteComboRequest } from '../api/combos';
import bgImage from '../assets/background-lego.jpg';

const GestionProductos = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('desc'); // Descendente por defecto
    const [filterType, setFilterType] = useState('all'); // Producto individual / Combo

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isComboModalOpen, setIsComboModalOpen] = useState(false);
    const [selectedCombo, setSelectedCombo] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isCuponModalOpen, setIsCuponModalOpen] = useState(false);

    const formatPrice = (p) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(p || 0);

    const fetchProducts = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const dataProducts = await getProductsRequest();
            setProducts(dataProducts);
        } catch (err) {
            console.error("Error fetching products", err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleToggleStatus = async (product) => {
        const nuevoEstado = product.estado === 'Publicado' ? 'NoPublicado' : 'Publicado';
        try {
            if (product.esCombo) {
                setProducts(prev => prev.map(p => p.idProducto === product.idProducto ? { ...p, estado: nuevoEstado } : p));
                await updateComboRequest(product.idCombo, { estado: nuevoEstado });
            } else {
                setProducts(prev => prev.map(p => p.idProducto === product.idProducto ? { ...p, estado: nuevoEstado } : p));
                await updateProductRequest(product.idProducto, { estado: nuevoEstado });
            }
        } catch (err) {
            alert('Error al actualizar el estado');
            fetchProducts(false);
        }
    };

    const handleToggleFeatured = async (product) => {
        try {
            if (product.esCombo) {
                setProducts(prev => prev.map(p => p.idProducto === product.idProducto ? { ...p, esDestacado: !product.esDestacado } : p));
                await updateComboRequest(product.idCombo, { esDestacado: !product.esDestacado });
            } else {
                setProducts(prev => prev.map(p => p.idProducto === product.idProducto ? { ...p, esDestacado: !product.esDestacado } : p));
                await updateProductRequest(product.idProducto, { esDestacado: !product.esDestacado });
            }
        } catch (err) {
            alert('Error al actualizar destacados');
            fetchProducts(false);
        }
    };

    const handleToggleNew = async (product) => {
        try {
            if (product.esCombo) {
                setProducts(prev => prev.map(p => p.idProducto === product.idProducto ? { ...p, esNovedad: !product.esNovedad } : p));
                await updateComboRequest(product.idCombo, { esNovedad: !product.esNovedad });
            } else {
                setProducts(prev => prev.map(p => p.idProducto === product.idProducto ? { ...p, esNovedad: !product.esNovedad } : p));
                await updateProductRequest(product.idProducto, { esNovedad: !product.esNovedad });
            }
        } catch (err) {
            alert('Error al actualizar novedades');
            fetchProducts(false);
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (productToDelete.esCombo) {
                const realId = productToDelete.idCombo;
                await deleteComboRequest(realId);
            } else {
                await deleteProductRequest(productToDelete.idProducto);
            }
            setIsConfirmModalOpen(false);
            fetchProducts(false);
        } catch (err) {
            alert(err.message || 'Error al eliminar');
            setIsConfirmModalOpen(false);
        }
    };

    const handleEditClick = (product) => {
        if (product.esCombo) {
            setSelectedCombo(product);
            setIsComboModalOpen(true);
        } else {
            setSelectedProduct(product);
            setIsProductModalOpen(true);
        }
    };

    const handleCreateClick = () => {
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };

    const handleCreateComboClick = () => {
        setSelectedCombo(null);
        setIsComboModalOpen(true);
    };

    const handleSaveCombo = async (formData) => {
        try {
            if (selectedCombo) {
                await updateComboRequest(selectedCombo.idCombo, formData);
            } else {
                await createComboRequest(formData);
            }
            setIsComboModalOpen(false);
            fetchProducts(false);
        } catch (err) {
            alert('Error al guardar el combo: ' + err.message);
        }
    };

    const handleSaveProduct = async (formData) => {
        try {
            if (selectedProduct) {
                await updateProductRequest(selectedProduct.idProducto, formData);
            } else {
                await createProductRequest(formData);
            }
            setIsProductModalOpen(false);
            fetchProducts(false);
        } catch (err) {
            alert('Error al guardar el producto: ' + err.message);
        }
    };

    const filteredProducts = products.filter(p => {
        const idStr = p.codigoProducto ? p.codigoProducto.toString() : (p.esCombo ? `CMB-${p.idCombo}` : (p.idProducto || p.id).toString());
        const matchSearch = idStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.titulo || p.nombre).toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'all' ? true : 
                         filterType === 'combo' ? p.esCombo : !p.esCombo;
        return matchSearch && matchType;
    }).sort((a, b) => {
        const idA = a.esCombo ? a.idCombo : a.idProducto;
        const idB = b.esCombo ? b.idCombo : b.idProducto;
        if (sortBy === 'asc') return idA - idB;
        return idB - idA;
    });

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            {/* Banner Section */}
            <section className="relative h-[250px] bg-slate-900 flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <img
                    src={bgImage}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    alt="Banner"
                />
                <div className="relative z-20 text-center space-y-2">
                    <h1 className="text-5xl font-black tracking-tight italic uppercase">Gestionar productos</h1>
                    <p className="text-sm font-medium tracking-widest uppercase opacity-80">
                        Inicio <span className="mx-2">&gt;</span> Gestionar productos
                    </p>
                </div>
            </section>

            {/* Filter Bar (Yellow) */}
            <div className="bg-brand-yellow py-4 px-10 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="relative bg-white rounded border border-slate-200">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-transparent pl-4 pr-10 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="desc">Por fecha de edición: Descendente</option>
                                <option value="asc">Por fecha de edición: Ascendente</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="relative bg-white rounded border border-slate-200">
                            <select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="appearance-none bg-transparent pl-4 pr-10 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="all">Por tipo: Todos</option>
                                <option value="individual">Producto individual</option>
                                <option value="combo">Combo</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <input 
                            type="text" 
                            placeholder="Buscar productos (por código o nombre)" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition shadow-sm"
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    <div className="text-sm font-black text-slate-900 uppercase">
                        Resultados: <span className="text-xl ml-1">{filteredProducts.length}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="max-w-7xl mx-auto w-full py-8 px-6 flex flex-wrap justify-center gap-6">
                <button 
                    onClick={() => handleCreateComboClick()}
                    className="flex items-center gap-3 bg-white border-2 border-slate-900 px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm hover:bg-slate-900 hover:text-white transition group shadow-sm"
                >
                    Crear nuevo combo <Plus size={18} className="transition-transform group-hover:rotate-90" />
                </button>
                <button 
                    onClick={() => handleCreateClick()}
                    className="flex items-center gap-3 bg-white border-2 border-slate-900 px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm hover:bg-slate-900 hover:text-white transition group shadow-sm"
                >
                    Cargar nuevo producto <Plus size={18} className="transition-transform group-hover:rotate-90" />
                </button>
                <button 
                    onClick={() => setIsCuponModalOpen(true)}
                    className="flex items-center gap-3 bg-brand-yellow border-2 border-slate-900 px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm text-slate-900 hover:bg-slate-900 hover:text-brand-yellow transition group shadow-sm"
                >
                    Gestionar cupones <Plus size={18} className="transition-transform group-hover:rotate-90" />
                </button>
            </div>

            {/* Product List */}
            <main className="flex-1 max-w-7xl mx-auto w-full pb-20 px-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-red"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProducts.map((product) => (
                            <div key={product.idProducto} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-center">
                                    {/* Code Section */}
                                    <div className="p-6 border-r border-slate-100 min-w-[200px] flex flex-col items-center justify-center bg-slate-50/50">
                                        <p className="text-lg font-bold text-slate-400">Código: <span className="text-slate-900 font-black">{product.codigoProducto}</span></p>
                                        <div className="flex gap-2 mt-4">
                                            <button 
                                                onClick={() => handleDeleteClick(product)}
                                                className="bg-slate-200 p-2 rounded hover:bg-red-500 hover:text-white transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleEditClick(product)}
                                                className="bg-slate-200 p-2 rounded hover:bg-slate-900 hover:text-white transition"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 p-6 border-r border-slate-100 min-w-[250px]">
                                        <h3 className="text-xl font-black text-slate-800 uppercase italic mb-1 truncate">
                                            {product.titulo || product.nombre}
                                        </h3>
                                        <p className="text-sm font-bold text-slate-500">Precio unitario: <span className="text-brand-red font-black">{formatPrice(product.precio)}</span></p>
                                        <p className="text-sm font-bold text-slate-500">En Stock: <span className="text-slate-900 font-black">{product.stock || 0}</span></p>
                                    </div>

                                    {/* Status Section */}
                                    <div className="p-6 border-r border-slate-100 text-center min-w-[120px]">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Estado</p>
                                        <div 
                                            className="relative inline-flex items-center cursor-pointer"
                                            onClick={() => handleToggleStatus(product)}
                                        >
                                            <div className={`w-11 h-6 rounded-full transition-all duration-200 ${product.estado === 'Publicado' ? 'bg-green-500' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-200 shadow-sm ${product.estado === 'Publicado' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Featured Section */}
                                    <div className="p-6 border-r border-slate-100 text-center min-w-[120px]">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Destacados</p>
                                        <div 
                                            className="relative inline-flex items-center cursor-pointer"
                                            onClick={() => handleToggleFeatured(product)}
                                        >
                                            <div className={`w-11 h-6 rounded-full transition-all duration-200 ${product.esDestacado ? 'bg-green-500' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-200 shadow-sm ${product.esDestacado ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Section */}
                                    <div className="p-6 text-center min-w-[120px]">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Novedades</p>
                                        <div 
                                            className="relative inline-flex items-center cursor-pointer"
                                            onClick={() => handleToggleNew(product)}
                                        >
                                            <div className={`w-11 h-6 rounded-full transition-all duration-200 ${product.esNovedad ? 'bg-green-500' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-200 shadow-sm ${product.esNovedad ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 flex justify-center">
                    <button className="bg-white border-2 border-slate-300 text-slate-800 px-10 py-3 font-black uppercase tracking-widest rounded-lg hover:border-slate-900 transition shadow-sm">
                        Ver más
                    </button>
                </div>
            </main>

            <Footer />

            <ProductModal 
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSave={handleSaveProduct}
                product={selectedProduct}
            />

            <ComboModal 
                isOpen={isComboModalOpen}
                onClose={() => setIsComboModalOpen(false)}
                onSave={handleSaveCombo}
                combo={selectedCombo}
            />

            <ConfirmModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title={productToDelete?.esCombo ? "¿Eliminar combo?" : "¿Eliminar producto?"}
                message={`¿Estás seguro que deseas eliminar "${productToDelete?.titulo || productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
            />

            <CuponModal 
                isOpen={isCuponModalOpen}
                onClose={() => setIsCuponModalOpen(false)}
            />
        </div>
    );
};

export default GestionProductos;
