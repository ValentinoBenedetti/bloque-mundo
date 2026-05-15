import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getTemasRequest } from '../api/temas';
import { uploadProductImageRequest } from '../api/products';

const ProductModal = ({ isOpen, onClose, onSave, product }) => {
    const [temas, setTemas] = useState([]);
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

    useEffect(() => {
        const fetchTemas = async () => {
            try {
                const data = await getTemasRequest();
                setTemas(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTemas();
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

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
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
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tema</label>
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
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Cantidad de piezas"
                            />
                        </div>

                        {/* Categoría */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Categoría</label>
                            <select
                                name="categoria" value={formData.categoria} onChange={handleChange}
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium bg-white"
                            >
                                <option value="">Seleccione categoría</option>
                                {[
                                    "Animales", "Arquitectura", "Botánica", "Castillos", "Ciudad", 
                                    "Construcción Básica", "Edificios", "Espacio", "Fantasía", "Mecanismos", 
                                    "Minifiguras", "Naves", "Películas y TV", "Piratas", 
                                    "Robótica", "Series", "Sets de Colección", "Superhéroes", "Trenes", 
                                    "Vehículos", "Videojuegos"
                                ].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Precio */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Precio de venta</label>
                            <input
                                type="number" name="precio" value={formData.precio} onChange={handleChange} required
                                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-brand-red outline-none transition text-sm font-medium"
                                placeholder="Ingrese el precio"
                            />
                        </div>

                        {/* Stock */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Cantidad disponible</label>
                            <input
                                type="number" name="stock" value={formData.stock} onChange={handleChange} required
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
        </div>
    );
};

export default ProductModal;
