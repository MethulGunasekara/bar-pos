import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import axios from 'axios';
import { useState, useEffect } from 'react';
import CheckoutModal from '../components/CheckoutModal'; 

const POS = () => {
    const { user } = useAuth(); 
    // IMPORTANT: Make sure you import removeFromCart from your context!
    const { cart, addToCart, clearCart, removeFromCart } = useCart(); 
    const total = cart.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [customProductIds, setCustomProductIds] = useState([]);
    
    // NEW: State to track if the right pane is currently in "Edit" mode
    const [isCustomizing, setIsCustomizing] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products');
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to load menu", error);
            }
        };
        fetchMenu();
    }, []);

    useEffect(() => {
        if (user && user.username) {
            const savedCustomItems = localStorage.getItem(`custom_menu_${user.username}`);
            if (savedCustomItems) {
                setCustomProductIds(JSON.parse(savedCustomItems));
            } else {
                setCustomProductIds([]); 
            }
        }
    }, [user]);

    const toggleCustomProduct = (productId) => {
        let updatedList;
        if (customProductIds.includes(productId)) {
            updatedList = customProductIds.filter(id => id !== productId);
        } else {
            updatedList = [...customProductIds, productId];
        }
        
        setCustomProductIds(updatedList);
        if (user && user.username) {
            localStorage.setItem(`custom_menu_${user.username}`, JSON.stringify(updatedList));
        }
    };

    const handlePayment = async (paymentMethod) => {
        try {
            const orderData = { 
                orderItems: cart, 
                paymentMethod: paymentMethod, 
                total: total 
            };

            const response = await axios.post('http://localhost:5000/api/orders', orderData);
            
            if (response.status === 201) {
                if(clearCart) clearCart(); 
                setIsModalOpen(false); 
                alert(`Success! Order rung up via ${paymentMethod}`);
            }
        } catch (error) {
            console.error('Error saving order:', error.response?.data || error.message);
            alert('Failed to process order. Check console.');
        }
    };

    const dbCategories = [...new Set(products.map(item => item.category))].sort((a, b) => a.localeCompare(b));
    const categories = ['Custom', 'All', ...dbCategories];

    let displayProducts = [];
    if (selectedCategory === 'Custom') {
        displayProducts = products.filter(p => customProductIds.includes(p._id));
    } else if (selectedCategory === 'All') {
        displayProducts = products;
    } else {
        displayProducts = products.filter(p => p.category === selectedCategory);
    }
    
    displayProducts.sort((a, b) => a.name.localeCompare(b.name));
    const allSortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
            
            {/* LEFT PANE */}
            <div style={{ flex: 6, borderRight: '2px solid #ccc', padding: '1rem', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
                <h2>Menu</h2>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {categories.map(category => (
                        <button 
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                // If they click away from the Custom tab, turn off Edit mode automatically
                                if (category !== 'Custom') setIsCustomizing(false);
                            }}
                            style={{ 
                                padding: '10px 20px', cursor: 'pointer', borderRadius: '5px',
                                border: '1px solid #ccc', fontWeight: 'bold', whiteSpace: 'nowrap',
                                backgroundColor: selectedCategory === category ? '#333' : '#fff',
                                color: selectedCategory === category ? '#fff' : '#333'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', overflowY: 'auto' }}>
                    {displayProducts.length === 0 && selectedCategory === 'Custom' ? (
                        <p style={{ color: '#888', gridColumn: '1 / -1' }}>Your custom menu is empty. Click "Edit Custom Menu" on the right to add items!</p>
                    ) : (
                        displayProducts.map(product => (
                            <button 
                                key={product._id}
                                onClick={() => addToCart(product)}
                                style={{ height: '100px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px' }}
                            >
                                {product.name} <br/> ${product.price.toFixed(2)}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT PANE */}
            <div style={{ flex: 4, padding: '1rem', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                
                {/* Only show the full customization view if BOTH the Custom tab is active AND they clicked Edit */}
                {selectedCategory === 'Custom' && isCustomizing ? (
                    <>
                        <h2>Customize Your Menu</h2>
                        <p style={{ color: '#666', marginBottom: '10px' }}>Click to add/remove products from your personal Custom tab.</p>
                        
                        <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                            {allSortedProducts.map(product => {
                                const isSelected = customProductIds.includes(product._id);
                                return (
                                    <div 
                                        key={product._id} 
                                        onClick={() => toggleCustomProduct(product._id)}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                            padding: '15px', marginBottom: '10px', fontSize: '1.2rem', 
                                            cursor: 'pointer', borderRadius: '5px',
                                            backgroundColor: isSelected ? '#e8f5e9' : '#f4f4f4',
                                            border: isSelected ? '2px solid #4CAF50' : '1px solid #ddd'
                                        }}
                                    >
                                        <span>{product.name} ({product.category})</span>
                                        <span style={{ fontWeight: 'bold', color: isSelected ? '#4CAF50' : '#888' }}>
                                            {isSelected ? '✓ Added' : '+ Add'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Done Customizing Button toggles the state off */}
                        <button 
                            onClick={() => setIsCustomizing(false)}
                            style={{ marginTop: '10px', width: '100%', height: '60px', fontSize: '1.5rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Done Customizing
                        </button>
                    </>
                ) : (
                    /* --- STANDARD CART VIEW --- */
                    <>
                        {/* Header Area with dynamic Edit button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h2 style={{ margin: 0 }}>Current Order</h2>
                            
                            {/* Render the Edit button ONLY when looking at the Custom tab */}
                            {selectedCategory === 'Custom' && (
                                <button 
                                    onClick={() => setIsCustomizing(true)}
                                    style={{ padding: '8px 15px', fontSize: '1rem', backgroundColor: '#ff9800', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ✏️ Edit Custom Menu
                                </button>
                            )}
                        </div>

                        {/* Cart List */}
                        <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                            {cart.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#888' }}>Cart is empty</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '1.2rem', paddingBottom: '10px', borderBottom: '1px dashed #ccc' }}>
                                        {/* Shows aggregated quantity, e.g., "3x Margarita" */}
                                        <span>{item.quantity}x {item.name}</span>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {/* Shows the calculated total for those 3 Margaritas */}
                                            <span style={{ fontWeight: 'bold' }}>${(item.priceAtSale * item.quantity).toFixed(2)}</span>
                                            
                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => removeFromCart && removeFromCart(item.productId)}
                                                style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                                                title="Remove Item"
                                            >
                                                X
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ borderTop: '2px solid #333', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.8rem', fontWeight: 'bold', margin: '10px 0' }}>
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                style={{ width: '100%', height: '80px', fontSize: '2.5rem', backgroundColor: cart.length > 0 ? '#4CAF50' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', cursor: cart.length > 0 ? 'pointer' : 'not-allowed' }}
                                disabled={cart.length === 0}
                            >
                                PAY
                            </button>
                        </div>
                    </>
                )}
            </div>
            <CheckoutModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                total={total} 
                onPayment={handlePayment} 
            />
        </div>
    );
};

export default POS;