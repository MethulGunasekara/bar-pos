import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, X, ArrowLeft, LayoutGrid } from 'lucide-react';
import Topbar from '../components/Topbar';
import { formatMoney } from '../utils/format';
import './ProductsAdmin.css';

const ProductsAdmin = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: '', category: '', price: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchProducts = async () => {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/products/${editingId}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/products', formData);
            }
            setFormData({ name: '', category: '', price: '' });
            setEditingId(null);
            fetchProducts();
        } catch (error) {
            console.error("Error saving product", error);
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
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', category: '', price: '' });
    };

    return (
        <div className="products-screen">
            <Topbar title="Menu manager">
                <Link to="/admin" className="btn btn-sm btn-primary">
                    <ArrowLeft size={14} /> Dashboard
                </Link>
            </Topbar>

            <main className="products-main">
                <div className="products-heading">
                    <h1>Menu manager</h1>
                    <p>Add, edit, or remove drinks from the till menu.</p>
                </div>

                <form onSubmit={handleSubmit} className="product-form card">
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
                    <div className="product-form-actions">
                        <button type="submit" className={`btn ${editingId ? 'btn-info' : 'btn-primary'}`}>
                            {editingId ? <><Pencil size={15} /> Update</> : <><Plus size={15} /> Add drink</>}
                        </button>
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="icon-btn" aria-label="Cancel edit">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </form>

                <div className="product-table-wrap card">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th aria-label="Actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="product-table-empty">No drinks on the menu yet — add your first one above.</td>
                                </tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p._id} className={editingId === p._id ? 'is-editing' : ''}>
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
