import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, X, ArrowLeft, LayoutGrid, ImagePlus, Image as ImageIcon, TriangleAlert } from 'lucide-react';
import Topbar from '../components/Topbar';
import { formatMoney } from '../utils/format';
import { getImageUrl } from '../utils/imageUrl';
import './ProductsAdmin.css';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB, mirrors the backend limit
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const ProductsAdmin = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: '', category: '', price: '' });
    const [editingId, setEditingId] = useState(null);

    const [imageFile, setImageFile] = useState(null);   // newly chosen file, not yet saved
    const [imagePreview, setImagePreview] = useState(''); // object URL or existing image URL
    const [removeImage, setRemoveImage] = useState(false); // explicit "clear image" flag while editing

    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchProducts = async () => {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
    };

    useEffect(() => { fetchProducts(); }, []);

    const resetForm = () => {
        setFormData({ name: '', category: '', price: '' });
        setEditingId(null);
        setImageFile(null);
        setImagePreview('');
        setRemoveImage(false);
        setFormError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setFormError('Please choose a PNG, JPG, WEBP, or GIF image.');
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            setFormError('That image is over 5MB — please use a smaller file.');
            return;
        }

        setFormError('');
        setRemoveImage(false);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview('');
        setRemoveImage(true); // tells the backend to drop the existing image on save
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('category', formData.category);
            payload.append('price', formData.price);
            if (imageFile) payload.append('image', imageFile);
            if (removeImage) payload.append('removeImage', 'true');

            if (editingId) {
                await axios.put(`http://localhost:5000/api/products/${editingId}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/products', payload);
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            setFormError(error.response?.data?.message || 'Could not save this product. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this?")) {
            await axios.delete(`http://localhost:5000/api/products/${id}`);
            fetchProducts();
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setFormData({ name: product.name, category: product.category, price: product.price });
        setImageFile(null);
        setImagePreview(product.image ? getImageUrl(product.image) : '');
        setRemoveImage(false);
        setFormError('');
    };

    return (
        <div className="products-screen">
            <Topbar title="Menu manager">
                <Link to="/admin" className="btn btn-sm btn-soft">
                    <ArrowLeft size={14} /> Dashboard
                </Link>
                <Link to="/pos" className="btn btn-sm btn-primary">
                    <LayoutGrid size={14} /> POS terminal
                </Link>
            </Topbar>

            <main className="products-main">
                <div className="products-heading">
                    <h1>Menu manager</h1>
                    <p>Add, edit, or remove drinks from the till menu.</p>
                </div>

                <form onSubmit={handleSubmit} className="product-form card">
                    {formError && (
                        <div className="form-error">
                            <TriangleAlert size={15} />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="product-form-top">
                        <label className="image-picker">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Product preview" />
                            ) : (
                                <span className="image-picker-empty">
                                    <ImagePlus size={20} strokeWidth={1.75} />
                                    <span>Photo</span>
                                </span>
                            )}
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/gif"
                                onChange={handleImageChange}
                                hidden
                            />
                        </label>

                        <div className="product-form-fields">
                            <div className="product-form-field">
                                <label className="field-label">Drink name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g. Old Fashioned"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="product-form-row">
                                <div className="product-form-field">
                                    <label className="field-label">Category</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. Cocktails"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="product-form-field product-form-field--price">
                                    <label className="field-label">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="product-form-actions">
                        <button type="submit" className={`btn ${editingId ? 'btn-info' : 'btn-primary'}`} disabled={saving}>
                            {saving ? 'Saving…' : editingId ? (<><Pencil size={15} /> Update</>) : (<><Plus size={15} /> Add drink</>)}
                        </button>
                        {imagePreview && (
                            <button type="button" onClick={handleClearImage} className="btn btn-sm btn-ghost">
                                <X size={14} /> Remove photo
                            </button>
                        )}
                        {editingId && (
                            <button type="button" onClick={resetForm} className="icon-btn" aria-label="Cancel edit">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </form>

                <div className="product-table-wrap card">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th aria-label="Photo"></th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th aria-label="Actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="product-table-empty">No drinks on the menu yet — add your first one above.</td>
                                </tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p._id} className={editingId === p._id ? 'is-editing' : ''}>
                                        <td>
                                            {p.image ? (
                                                <img src={getImageUrl(p.image)} alt="" className="product-thumb" />
                                            ) : (
                                                <span className="product-thumb product-thumb--empty">
                                                    <ImageIcon size={15} strokeWidth={1.75} />
                                                </span>
                                            )}
                                        </td>
                                        <td className="product-table-name">{p.name}</td>
                                        <td><span className="badge badge-sky">{p.category}</span></td>
                                        <td className="price">{formatMoney(p.price)}</td>
                                        <td className="product-table-actions">
                                            <button onClick={() => handleEdit(p)} className="icon-btn" aria-label="Edit">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(p._id)} className="icon-btn product-delete" aria-label="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default ProductsAdmin;