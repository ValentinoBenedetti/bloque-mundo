import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2, Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getTemasRequest, createTemaRequest, deleteTemaRequest } from '../api/temas';
import { getCategoriasRequest, createCategoriaRequest, deleteCategoriaRequest } from '../api/categorias';
import { uploadProductImageRequest } from '../api/products';
import ConfirmModal from './ConfirmModal';
import PromptModal from './PromptModal';

const ProductModal = ({ isOpen, onClose, onSave, product }) => {
    const [temas, setTemas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [formData, setFormData] = useState({
        codigoProducto: '',
        titulo: '',
        idTema: '',
        rangoEdad: '',
        cantidadPiezas: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        esDestacado: false,
        esNovedad: false,
        estado: 'Publicado',
        imagen: ''
    });

    const [allImages, setAllImages] = useState([]); // Array de { id, url, file, isNew }
    const [isUploading, setIsUploading] = useState(false);
    
    // States for custom modals
    const [promptState, setPromptState] = useState({ isOpen: false, title: '', placeholder: '', onConfirm: null });
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [alertState, setAlertState] = useState({ isOpen: false, title: '', message: '', type: 'error' });

    const fetchTemas = async () => {
        try {
            const data = await getTemasRequest();
            setTemas(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategorias = async () => {
        try {
            const data = await getCategoriasRequest();
            setCategorias(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTemas();
        fetchCategorias();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                codigoProducto: product.codigoProducto || '',
                titulo: product.titulo || '',
                idTema: product.tema?.idTema || '',
                rangoEdad: product.rangoEdad || '',
                cantidadPiezas: product.cantidadPiezas || '',
                descripcion: product.descripcion || '',
                precio: product.precio || '',
                stock: product.stock || '',
                categoria: product.categoria || '',
                esDestacado: product.esDestacado || false,
                esNovedad: product.esNovedad || false,
                estado: product.estado || 'Publicado',
                imagen: product.imagen || ''
            });
            const initialImages = (product.imagenes?.length > 0 ? product.imagenes : (product.imagen ? [product.imagen] : []))
                .map((url, idx) => ({ id: `existing-${idx}-${url}`, url, isNew: false }));
            setAllImages(initialImages);
        } else {
            setFormData({
                codigoProducto: '',
                titulo: '',
                idTema: '',
                rangoEdad: '',
                cantidadPiezas: '',
                descripcion: '',
                precio: '',
                stock: '',
                categoria: '',
                esDestacado: false,
                esNovedad: false,
                estado: 'Publicado',
                imagen: ''
            });
            setAllImages([]);
        }
    }, [product, isOpen]);

    const [error, setError] = useState(null);

    const handleAddTema = () => {
        setPromptState({
            isOpen: true,
            title: "Nuevo Tema",
            placeholder: "Ingrese el nombre del tema...",
            onConfirm: async (nombre) => {
                try {
                    const nuevoTema = await createTemaRequest({ nombre });
                    await fetchTemas();
                    setFormData(prev => ({ ...prev, idTema: nuevoTema.idTema }));
                    setAlertState({
                        isOpen: true,
                        title: "¡Éxito!",
                        message: "Tema creado correctamente",
                        type: "success"
                    });
                } catch (err) {
                    setAlertState({
                        isOpen: true,
                        title: "¡Atención!",
                        message: "Error al crear tema. Verifique que no exista.",
                        type: "error"
                    });
                }
            }
        });
    };

    const handleDeleteTema = () => {
        if (!formData.idTema) {
            setAlertState({
                isOpen: true,
                title: "¡Atención!",
                message: "Seleccione un tema primero",
                type: "error"
            });
            return;
        }
        const temaSeleccionado = temas.find(t => String(t.idTema) === String(formData.idTema));
        
        setConfirmState({
            isOpen: true,
            title: "Eliminar Tema",
            message: `¿Seguro que desea eliminar el tema "${temaSeleccionado?.nombre}"?`,
            onConfirm: async () => {
                try {
                    await deleteTemaRequest(formData.idTema);
                    setFormData(prev => ({ ...prev, idTema: '' }));
                    await fetchTemas();
                    setAlertState({
                        isOpen: true,
                        title: "¡Éxito!",
                        message: "Tema eliminado correctamente",
                        type: "success"
                    });
                } catch (err) {
                    setAlertState({
                        isOpen: true,
                        title: "¡Atención!",
                        message: err.response?.data?.message || err.message || "Error al eliminar tema",
                        type: "error"
                    });
                }
            }
        });
    };

    const handleAddCategoria = () => {
        setPromptState({
            isOpen: true,
            title: "Nueva Categoría",
            placeholder: "Ingrese el nombre de la categoría...",
            onConfirm: async (nombre) => {
                try {
                    const nuevaCat = await createCategoriaRequest({ nombre });
                    await fetchCategorias();
                    setFormData(prev => ({ ...prev, categoria: nuevaCat.nombre }));
                    setAlertState({
                        isOpen: true,
                        title: "¡Éxito!",
                        message: "Categoría creada correctamente",
                        type: "success"
                    });
                } catch (err) {
                    setAlertState({
                        isOpen: true,
                        title: "¡Atención!",
                        message: "Error al crear categoría. Verifique que no exista.",
                        type: "error"
                    });
                }
            }
        });
    };

    const handleDeleteCategoria = () => {
        if (!formData.categoria) {
            setAlertState({
                isOpen: true,
                title: "¡Atención!",
                message: "Seleccione una categoría primero",
                type: "error"
            });
            return;
        }
        const catSeleccionada = categorias.find(c => c.nombre === formData.categoria);
        if (!catSeleccionada) {
            setAlertState({
                isOpen: true,
                title: "¡Atención!",
                message: "Esta categoría es estática o no se encuentra en la base de datos.",
                type: "error"
            });
            return;
        }
        
        setConfirmState({
            isOpen: true,
            title: "Eliminar Categoría",
            message: `¿Seguro que desea eliminar la categoría "${formData.categoria}"?`,
            onConfirm: async () => {
                try {
                    await deleteCategoriaRequest(catSeleccionada.idCategoria);
                    setFormData(prev => ({ ...prev, categoria: '' }));
                    await fetchCategorias();
                    setAlertState({
                        isOpen: true,
                        title: "¡Éxito!",
                        message: "Categoría eliminada correctamente",
                        type: "success"
                    });
                } catch (err) {
                    setAlertState({
                        isOpen: true,
                        title: "¡Atención!",
                        message: err.response?.data?.message || err.message || "Error al eliminar categoría",
                        type: "error"
                    });
                }
            }
        });
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Prevent negative values for specific numeric inputs
        if (type === 'number' && (name === 'cantidadPiezas' || name === 'stock' || name === 'precio')) {
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

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleKeyDownNoNegative = (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
            e.preventDefault();
        }
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
            await onSave({ ...formData, imagen: imagen, imagenes: finalImageUrls });
        } catch (err) {
            let msg = err.response?.data?.message || err.message || "Error al guardar el producto";
            
            if (msg.toLowerCase().includes("duplicate") || 
                msg.toLowerCase().includes("unique") || 
                msg.toLowerCase().includes("already in use") ||
                msg.toLowerCase().includes("crear el producto")
            ) {
                msg = "El código del producto ya está en uso. Por favor, cambie el código por uno nuevo.";
            }
            
            setError(msg);
            
            setTimeout(() => {
                const errorElement = document.getElementById('error-card');
                if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900 uppercase italic">
                        {product ? 'Editar producto' : 'Cargar nuevo producto'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition p-2 hover:bg-slate-50 rounded-full">
                        <X size={24} />
                    </button>
                </div>



                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Image Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex justify-between">
                            Imágenes del Producto
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
                                <span className="text-[10px] font-black uppercase tracking-tighter">Añadir</span>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Código */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Código</label>
                            <input
                                type="text" name="codigoProducto" value={formData.codigoProducto} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Ingrese el código del producto"
                            />
                        </div>

                        {/* Nombre */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nombre</label>
                            <input
                                type="text" name="titulo" value={formData.titulo} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Ingrese el nombre del producto"
                            />
                        </div>

                        {/* Tema */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tema</label>
                                <div className="flex gap-1">
                                    <button type="button" onClick={handleAddTema} className="p-1 text-slate-400 hover:text-green-600 transition" title="Agregar Tema"><Plus size={16} /></button>
                                    <button type="button" onClick={handleDeleteTema} className="p-1 text-slate-400 hover:text-red-600 transition" title="Eliminar Tema seleccionado"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <select
                                name="idTema" value={formData.idTema} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium bg-white appearance-none"
                            >
                                <option value="">Seleccione un tema</option>
                                {temas.map(t => (
                                    <option key={t.idTema} value={t.idTema}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Edad */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Edad</label>
                            <select
                                name="rangoEdad" value={formData.rangoEdad} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium bg-white"
                            >
                                <option value="">Seleccione edad</option>
                                <option value="4+">4+</option>
                                <option value="6+">6+</option>
                                <option value="9+">9+</option>
                                <option value="13+">13+</option>
                                <option value="18+">18+</option>
                            </select>
                        </div>

                        {/* Piezas */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Piezas</label>
                            <input
                                type="number" name="cantidadPiezas" value={formData.cantidadPiezas} onChange={handleChange}
                                min="0"
                                onKeyDown={handleKeyDownNoNegative}
                                onWheel={(e) => e.target.blur()}
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Cantidad de piezas"
                            />
                        </div>

                        {/* Categoría */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Categoría</label>
                                <div className="flex gap-1">
                                    <button type="button" onClick={handleAddCategoria} className="p-1 text-slate-400 hover:text-green-600 transition" title="Agregar Categoría"><Plus size={16} /></button>
                                    <button type="button" onClick={handleDeleteCategoria} className="p-1 text-slate-400 hover:text-red-600 transition" title="Eliminar Categoría seleccionada"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <select
                                name="categoria" value={formData.categoria} onChange={handleChange}
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium bg-white"
                            >
                                <option value="">Seleccione categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat.idCategoria} value={cat.nombre}>{cat.nombre}</option>
                                ))}
                                {formData.categoria && !categorias.some(c => c.nombre === formData.categoria) && (
                                    <option key="static-current" value={formData.categoria}>{formData.categoria} (Guardada)</option>
                                )}
                            </select>
                        </div>

                        {/* Precio */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Precio de venta</label>
                            <input
                                type="number" name="precio" value={formData.precio} onChange={handleChange} required
                                min="0"
                                onKeyDown={handleKeyDownNoNegative}
                                onWheel={(e) => e.target.blur()}
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Ingrese el precio"
                            />
                        </div>

                        {/* Stock */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Cantidad disponible</label>
                            <input
                                type="number" name="stock" value={formData.stock} onChange={handleChange} required
                                min="0"
                                onKeyDown={handleKeyDownNoNegative}
                                onWheel={(e) => e.target.blur()}
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Ingrese stock"
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descripción</label>
                        <textarea
                            name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4"
                            className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium resize-none"
                            placeholder="Descripción del producto..."
                        ></textarea>
                    </div>

                    <div className="flex flex-wrap gap-8 py-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="esDestacado" checked={formData.esDestacado} onChange={handleChange} className="sr-only" />
                            <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition ${formData.esDestacado ? 'bg-brand-red border-brand-red' : 'border-slate-200 group-hover:border-slate-300'}`}>
                                {formData.esDestacado && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Destacado</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="esNovedad" checked={formData.esNovedad} onChange={handleChange} className="sr-only" />
                            <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition ${formData.esNovedad ? 'bg-brand-red border-brand-red' : 'border-slate-200 group-hover:border-slate-300'}`}>
                                {formData.esNovedad && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Novedad</span>
                        </label>
                    </div>
 
                    {error && (
                        <div id="error-card" className="bg-red-50 border-2 border-red-100 p-5 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
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
                            {isUploading ? 'Subiendo...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>

            <PromptModal 
                isOpen={promptState.isOpen}
                onClose={() => setPromptState(prev => ({ ...prev, isOpen: false }))}
                onSubmit={promptState.onConfirm}
                title={promptState.title}
                placeholder={promptState.placeholder}
            />

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
            />

            {/* Centered Alert/Success Modal */}
            {alertState.isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce duration-1000 ${alertState.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                                {alertState.type === 'success' ? (
                                    <CheckCircle2 className="text-green-500" size={40} />
                                ) : (
                                    <AlertTriangle className="text-brand-red" size={40} />
                                )}
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-3 tracking-tight">
                                {alertState.title}
                            </h2>
                            
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                                {alertState.message}
                            </p>

                            <button
                                type="button"
                                onClick={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                                className="w-full px-4 py-4 rounded-xl bg-slate-900 text-white font-black hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 uppercase tracking-widest text-xs italic"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductModal;
