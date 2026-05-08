import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getProductsRequest } from '../api/products';

const ComboModal = ({ isOpen, onClose, onSave, combo }) => {
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    
    const [formData, setFormData] = useState({
        codigoCombo: '',
        titulo: '',
        descripcion: '',
        precio: '',
        fechaInicio: '',
        fechaFin: '',
        productosIds: []
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProductsRequest();
                // We might only want "Publicado" or individual products, but we'll load all for now.
                setProductosDisponibles(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (combo) {
            setFormData({
                codigoCombo: combo.codigoCombo || '',
                titulo: combo.titulo || '',
                descripcion: combo.descripcion || '',
                precio: combo.precio || '',
                fechaInicio: combo.fechaInicio || '',
                fechaFin: combo.fechaFin || '',
                productosIds: combo.productos?.map(p => p.idProducto) || []
            });
        } else {
            setFormData({
                codigoCombo: '',
                titulo: '',
                descripcion: '',
                precio: '',
                fechaInicio: '',
                fechaFin: '',
                productosIds: []
            });
        }
    }, [combo, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleProductToggle = (idProducto) => {
        setFormData(prev => {
            const currentIds = prev.productosIds;
            if (currentIds.includes(idProducto)) {
                return { ...prev, productosIds: currentIds.filter(id => id !== idProducto) };
            } else {
                return { ...prev, productosIds: [...currentIds, idProducto] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Since stock is dynamically calculated, we don't send it to backend,
        // but we ensure it's not present if not needed or we send a dummy value 0.
        // The DB schema might require it, so we can send 0 if the backend validation expects it.
        onSave({ ...formData, stock: 0 });
    };

    // Calculate dynamic stock based on selected products
    const calculateStock = () => {
        if (formData.productosIds.length === 0) return 0;
        const selectedProducts = productosDisponibles.filter(p => formData.productosIds.includes(p.idProducto));
        if (selectedProducts.length === 0) return 0;
        return Math.min(...selectedProducts.map(p => p.stock || 0));
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900 uppercase italic">
                        {combo ? 'Editar combo' : 'Crear nuevo combo'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition p-2 hover:bg-slate-50 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Codigo del Combo */}
                        <div className="space-y-2 md:col-span-1">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Código del Combo</label>
                            <input
                                type="text" name="codigoCombo" value={formData.codigoCombo} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Ej: CMB-123"
                            />
                        </div>

                        {/* Nombre del Combo */}
                        <div className="space-y-2 md:col-span-1">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nombre del Combo</label>
                            <input
                                type="text" name="titulo" value={formData.titulo} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Ej: Super Pack Navidad"
                            />
                        </div>

                        {/* Descripcion del Combo */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descripción</label>
                            <textarea
                                name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3"
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium resize-none"
                                placeholder="Escribe aquí de qué trata el combo..."
                            ></textarea>
                        </div>

                        {/* Precio */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Precio Final</label>
                            <input
                                type="number" name="precio" value={formData.precio} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Ingrese el precio"
                            />
                        </div>

                        {/* Stock Calculado */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Stock Disponible</label>
                            <div className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 text-sm font-black text-slate-900 flex items-center justify-between">
                                <span>Calculado automáticamente</span>
                                <span className="bg-brand-red text-white px-2 py-1 rounded text-xs">
                                    {calculateStock()} unidades
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 italic">
                                El stock del combo es igual al producto con menos stock.
                            </p>
                        </div>

                        {/* Fecha Inicio */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Fecha Inicio</label>
                            <input
                                type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium text-slate-700"
                            />
                        </div>

                        {/* Fecha Fin */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Fecha Fin</label>
                            <input
                                type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Selector de Productos */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Seleccionar Productos ({formData.productosIds.length} seleccionados)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border-2 border-slate-100 rounded-xl">
                            {productosDisponibles.map(p => (
                                <label key={p.idProducto} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition ${formData.productosIds.includes(p.idProducto) ? 'border-brand-red bg-red-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.productosIds.includes(p.idProducto)}
                                        onChange={() => handleProductToggle(p.idProducto)}
                                        className="w-5 h-5 accent-brand-red cursor-pointer"
                                    />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-bold text-slate-800 truncate">{p.titulo}</span>
                                        <span className="text-xs font-black text-slate-400">${p.precio}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-8 py-4 border-2 border-slate-200 text-slate-500 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-slate-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                        >
                            Guardar Combo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComboModal;
