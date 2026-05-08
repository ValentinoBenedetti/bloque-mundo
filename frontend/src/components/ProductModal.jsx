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

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
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
            setPreviewUrl(product.imagen || '');
            setSelectedFile(null);
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
            setPreviewUrl('');
            setSelectedFile(null);
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let finalImageUrl = formData.imagen;

        if (selectedFile) {
            try {
                setIsUploading(true);
                const uploadRes = await uploadProductImageRequest(selectedFile);
                finalImageUrl = uploadRes.url;
            } catch (err) {
                alert("Error al subir la imagen");
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        onSave({ ...formData, imagen: finalImageUrl });
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
                    <div className="flex justify-center">
                        <input
                            type="file" id="product-image" className="hidden"
                            accept="image/*" onChange={handleFileChange}
                        />
                        <label
                            htmlFor="product-image"
                            className="w-48 h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition overflow-hidden relative group"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                            ) : (
                                <>
                                    <ImageIcon size={40} strokeWidth={1.5} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Insertar imagen</span>
                                </>
                            )}

                            {previewUrl && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                                    Cambiar imagen
                                </div>
                            )}

                            {isUploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                    <Loader2 className="animate-spin text-brand-red" size={32} />
                                </div>
                            )}
                        </label>
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
                                <option value="Vehículos">Vehículos</option>
                                <option value="Edificios">Edificios</option>
                                <option value="Espacio">Espacio</option>
                                <option value="Fantasía">Fantasía</option>
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
