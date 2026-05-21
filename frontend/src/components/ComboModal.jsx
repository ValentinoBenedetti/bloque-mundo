import { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getProductsRequest, uploadProductImageRequest } from '../api/products';

const ComboModal = ({ isOpen, onClose, onSave, combo }) => {
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    
    const [formData, setFormData] = useState({
        codigoCombo: '',
        titulo: '',
        descripcion: '',
        precio: '',
        fechaInicio: '',
        fechaFin: '',
        productosIds: [],
        imagen: ''
    });

    const [allImages, setAllImages] = useState([]); // Array de { id, url, file, isNew }
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
                productosIds: combo.productos?.map(p => p.idProducto) || [],
                imagen: combo.imagen || ''
            });
            const initialImages = (combo.imagenes?.length > 0 ? combo.imagenes : (combo.imagen ? [combo.imagen] : []))
                .map((url, idx) => ({ id: `existing-${idx}-${url}`, url, isNew: false }));
            setAllImages(initialImages);
        } else {
            setFormData({
                codigoCombo: '',
                titulo: '',
                descripcion: '',
                precio: '',
                fechaInicio: '',
                fechaFin: '',
                productosIds: [],
                imagen: ''
            });
            setAllImages([]);
        }
    }, [combo, isOpen]);

    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        // Prevent negative values for price input
        if (type === 'number' && name === 'precio') {
            if (value !== '') {
                const numVal = parseFloat(value);
                if (numVal < 0 || isNaN(numVal)) {
                    setFormData({
                        ...formData,
                        [name]: '0'
                    });
                    return;
                }
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleKeyDownNoNegative = (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
            e.preventDefault();
        }
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
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                id: `new-${Math.random()}`,
                url: URL.createObjectURL(file),
                file: file,
                isNew: true
            }));
            setAllImages(prev => [...prev, ...newImages]);
        }
        e.target.value = null;
    };

    const removeImage = (id) => {
        setAllImages(prev => prev.filter(img => img.id !== id));
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('index', index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetIndex) => {
        const sourceIndex = e.dataTransfer.getData('index');
        if (sourceIndex === "" || sourceIndex === undefined) return;
        
        const updatedImages = [...allImages];
        const [movedImage] = updatedImages.splice(sourceIndex, 1);
        updatedImages.splice(targetIndex, 0, movedImage);
        setAllImages(updatedImages);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        let finalImageUrls = [];

        try {
            setIsUploading(true);
            for (let img of allImages) {
                if (img.isNew) {
                    const uploadRes = await uploadProductImageRequest(img.file);
                    finalImageUrls.push(uploadRes.url);
                } else {
                    finalImageUrls.push(img.url);
                }
            }
        } catch (err) {
            setError("Error al subir las imágenes. Por favor, intente de nuevo.");
            setIsUploading(false);
            return;
        } finally {
            setIsUploading(false);
        }

        const imagen = finalImageUrls.length > 0 ? finalImageUrls[0] : '';

        try {
            // Since stock is dynamically calculated, we don't send it to backend,
            // but we ensure it's not present if not needed or we send a dummy value 0.
            // The DB schema might require it, so we can send 0 if the backend validation expects it.
            await onSave({ ...formData, stock: 0, imagen: imagen, imagenes: finalImageUrls });
        } catch (err) {
            let msg = err.response?.data?.message || err.message || "Error al guardar el combo";
            if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("already in use")) {
                msg = "El código del combo ya está en uso. Por favor, cambie el código.";
            }
            setError(msg);

            // Scroll automático al error
            setTimeout(() => {
                const errorElement = document.getElementById('error-card-combo');
                if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    // Calculate dynamic stock based on selected products
    const calculateStock = () => {
        if (!formData.productosIds || formData.productosIds.length === 0) return 0;
        const selectedProducts = productosDisponibles.filter(p => formData.productosIds.includes(p.idProducto));
        if (selectedProducts.length === 0) return 0;
        return Math.min(...selectedProducts.map(p => p.stock || 0));
    };

    const filteredProductos = productosDisponibles
        .filter(p => !p.esCombo)
        .filter(p => 
            p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigoProducto?.toLowerCase().includes(searchTerm.toLowerCase())
        );

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
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex justify-between">
                            Imágenes del Combo
                            <span className="text-[9px] font-bold text-slate-400 italic">Arrastra para reordenar</span>
                        </label>
                        <div className="flex flex-wrap gap-4">
                            {allImages.map((img, idx) => (
                                <div 
                                    key={img.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 group shadow-sm cursor-move active:scale-95 transition-transform ${img.isNew ? 'border-brand-red/20' : 'border-slate-100'}`}
                                >
                                    <img src={img.url} className="w-full h-full object-cover pointer-events-none" alt="Preview" />
                                    {img.isNew && (
                                        <div className="absolute top-1 left-1 bg-brand-red text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase">Nuevo</div>
                                    )}
                                    <button
                                        type="button" onClick={() => removeImage(img.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg z-10"
                                    >
                                        <X size={12} />
                                    </button>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
                                </div>
                            ))}

                            {/* Add Button */}
                            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-red hover:bg-red-50 transition text-slate-400 hover:text-brand-red group shadow-sm bg-slate-50/50">
                                <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase">Añadir</span>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    </div>
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
                                min="0"
                                onKeyDown={handleKeyDownNoNegative}
                                onWheel={(e) => e.target.blur()}
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
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Seleccionar Productos ({formData.productosIds.length} seleccionados)
                            </label>
                            <div className="relative flex-1 max-w-xs">
                                <input 
                                    type="text"
                                    placeholder="Buscar por nombre o código..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-xs font-bold"
                                />
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border-2 border-slate-100 rounded-xl">
                            {filteredProductos.length > 0 ? (
                                filteredProductos.map(p => (
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
                                ))
                            ) : (
                                <div className="col-span-2 py-8 text-center">
                                    <p className="text-sm font-bold text-slate-400 italic">No se encontraron productos con "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div id="error-card-combo" className="bg-red-50 border-2 border-red-100 p-5 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-red-500 text-white p-2 rounded-xl shrink-0 shadow-lg shadow-red-200">
                                <X size={20} strokeWidth={3} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-red-700 uppercase tracking-widest mb-1">¡Atención!</span>
                                <p className="text-sm font-bold text-red-600/80 leading-tight">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-8 py-4 border-2 border-slate-200 text-slate-500 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-slate-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="flex-1 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-black transition shadow-lg disabled:bg-slate-400 flex items-center justify-center gap-2"
                        >
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : null}
                            {isUploading ? 'Subiendo...' : 'Guardar Combo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComboModal;
