import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProductsAdmin = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: '', category: '', price: '' });
    const [editingId, setEditingId] = useState(null);

    // READ
    const fetchProducts = async () => {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
    };

    useEffect(() => { fetchProducts(); }, []);

    // CREATE OR UPDATE
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing
                await axios.put(`http://localhost:5000/api/products/${editingId}`, formData);
            } else {
                // Create new
                await axios.post('http://localhost:5000/api/products', formData);
            }
            setFormData({ name: '', category: '', price: '' });
            setEditingId(null);
            fetchProducts(); // Refresh the list
        } catch (error) {
            console.error("Error saving product", error);
        }
    };

    // DELETE
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

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Menu Manager</h1>
            
            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '2rem', background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
                <input type="text" placeholder="Drink Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <input type="text" placeholder="Category (e.g. Beers)" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
                <input type="number" step="0.01" placeholder="Price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                <button type="submit" style={{ background: editingId ? '#ff9800' : '#4CAF50', color: 'white', border: 'none', padding: '10px' }}>
                    {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({name: '', category: '', price: ''}) }}>Cancel</button>}
            </form>

            {/* List */}
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#333', color: 'white' }}>
                        <th style={{ padding: '10px' }}>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '10px' }}>{p.name}</td>
                            <td>{p.category}</td>
                            <td>${p.price.toFixed(2)}</td>
                            <td>
                                <button onClick={() => handleEdit(p)} style={{ marginRight: '10px', cursor: 'pointer' }}>Edit</button>
                                <button onClick={() => handleDelete(p._id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div style={{ marginTop: '2rem' }}>
                 <Link to="/admin">← Back to Dashboard</Link> | <Link to="/pos">Go to POS →</Link>
            </div>
        </div>
    );
};

export default ProductsAdmin;