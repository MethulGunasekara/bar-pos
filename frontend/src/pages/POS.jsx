import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Pencil, Minus, Plus, Trash2, ShoppingBag, Check, Receipt } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import Topbar from '../components/Topbar';
import { formatMoney } from '../utils/format';
import { getImageUrl } from '../utils/imageUrl';
import './POS.css';

const POS = () => {
    const { user } = useAuth();
    const { cart, addToCart, clearCart, removeFromCart, decreaseFromCart } = useCart();
    const total = cart.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Custom');
    const [customProductIds, setCustomProductIds] = useState([]);

    const [isCustomizing, setIsCustomizing] = useState(false);

    const [isKeypadOpen, setIsKeypadOpen] = useState(false);
    const [customInput, setCustomInput] = useState('');

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
                if (clearCart) clearCart();
                setIsModalOpen(false);
                alert(`Success! Order rung up via ${paymentMethod}`);
            }
        } catch (error) {
            console.error('Error saving order:', error.response?.data || error.message);
            alert('Failed to process order. Check console.');
        }
    };

    const handleKeypadPress = (key) => {
        if (key === '⌫') {
            setCustomInput(prev => prev.slice(0, -1));
        } else if (key === '.') {
            if (!customInput.includes('.')) {
                setCustomInput(prev => prev + key);
            }
        } else {
            if (customInput === '0') {
                setCustomInput(key);
            } else {
                setCustomInput(prev => prev + key);
            }
        }
    };

    const handleAddCustomPrice = () => {
        const priceVal = parseFloat(customInput);
        if (isNaN(priceVal) || priceVal <= 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }

        // Generate a random 24-character hex string so Mongoose accepts it as a valid ObjectId!
        const dummyObjectId = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

        const customProduct = {
            _id: dummyObjectId, 
            name: 'Custom price', // Updated to match your new card text
            price: priceVal,
            category: 'Custom'
        };

        addToCart(customProduct);
        setIsKeypadOpen(false);
        setCustomInput('');
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

    const showCustomizer = selectedCategory === 'Custom' && isCustomizing;

    return (
        <div className="pos-screen">
            <Topbar title="POS Terminal" />

            <div className="pos-body">
                <section className="pos-menu">
                    <div className="pos-menu-header">
                        <h2>Menu</h2>
                        <span className="pos-item-count">{displayProducts.length} item{displayProducts.length === 1 ? '' : 's'}</span>
                    </div>

                    <div className="pos-tabs">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    if (category !== 'Custom') setIsCustomizing(false);
                                }}
                                className={`pos-tab ${selectedCategory === category ? 'is-active' : ''}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="pos-grid">
                        

                        {displayProducts.map(product => (
                            <button
                                key={product._id}
                                onClick={() => addToCart(product)}
                                className={`product-card ${product.image ? 'has-image' : 'no-image'}`}
                                style={product.image ? { backgroundImage: `url(${getImageUrl(product.image)})` } : undefined}
                            >
                                <div className="product-card-label">
                                    <span className="product-name">{product.name}</span>
                                    <span className="product-price price">{formatMoney(product.price)}</span>
                                </div>
                            </button>
                        ))}

                        {/* CUSTOM PRICE CARD - Stripped down and centered */}
                        {(selectedCategory === 'Custom' || selectedCategory === 'All') && !isCustomizing && (
                            <button
                                onClick={() => setIsKeypadOpen(true)}
                                className="product-card no-image"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <span className="product-name" style={{ textAlign: 'center', margin: 0 }}>Custom Price</span>
                            </button>
                        )}

                        {displayProducts.length === 0 && selectedCategory === 'Custom' && (
                            <div className="pos-empty" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                <ShoppingBag size={28} strokeWidth={1.75} />
                                <p>Your custom menu is empty.<br />Use "Edit Custom Menu" on the right to add favorites.</p>
                            </div>
                        )}
                        {displayProducts.length === 0 && selectedCategory !== 'Custom' && selectedCategory !== 'All' && (
                            <div className="pos-empty" style={{ gridColumn: '1 / -1' }}>
                                <ShoppingBag size={28} strokeWidth={1.75} />
                                <p>No items in this category yet.</p>
                            </div>
                        )}
                    </div>
                </section>

                <aside className="pos-order">
                    {showCustomizer ? (
                        <>
                            <div className="order-header">
                                <h2>Customize menu</h2>
                            </div>
                            <p className="customize-hint">Tap items to add or remove them from your personal Custom tab.</p>

                            <div className="customize-list">
                                {allSortedProducts.map(product => {
                                    const isSelected = customProductIds.includes(product._id);
                                    return (
                                        <button
                                            key={product._id}
                                            onClick={() => toggleCustomProduct(product._id)}
                                            className={`customize-row ${isSelected ? 'is-selected' : ''}`}
                                        >
                                            <span className="customize-name">
                                                {product.name}
                                                <span className="customize-category">{product.category}</span>
                                            </span>
                                            <span className="customize-state">
                                                {isSelected ? (<><Check size={14} /> Added</>) : '+ Add'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setIsCustomizing(false)}
                                className="btn btn-info customize-done"
                            >
                                Done customizing
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="order-header">
                                <h2>Current order</h2>
                                {selectedCategory === 'Custom' && (
                                    <button
                                        onClick={() => setIsCustomizing(true)}
                                        className="btn btn-sm btn-soft"
                                    >
                                        <Pencil size={13} /> Edit custom menu
                                    </button>
                                )}
                            </div>

                            <div className="order-perf" />

                            <div className="order-list">
                                {cart.length === 0 ? (
                                    <div className="order-empty">
                                        <ShoppingBag size={26} strokeWidth={1.75} />
                                        <p>Cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item, idx) => {
                                        const sourceProduct = products.find(p => p._id === item.productId);
                                        return (
                                            <div key={item.productId}>
                                                {idx > 0 && <hr className="ticket-dash" />}
                                                <div className="order-line">
                                                    <div className="order-line-main">
                                                        <span className="order-line-name">{item.name}</span>
                                                        <div className="qty-stepper">
                                                            <button
                                                                onClick={() => decreaseFromCart(item.productId)}
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus size={13} />
                                                            </button>
                                                            <span>{item.quantity}</span>
                                                            <button
                                                                onClick={() => sourceProduct && addToCart(sourceProduct)}
                                                                aria-label="Increase quantity"
                                                                disabled={!sourceProduct}
                                                            >
                                                                <Plus size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="order-line-end">
                                                        <span className="price">{formatMoney(item.priceAtSale * item.quantity)}</span>
                                                        <button
                                                            onClick={() => removeFromCart(item.productId)}
                                                            className="icon-btn order-remove"
                                                            title="Remove item"
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="order-footer">
                                <div className="order-total-row">
                                    <span>Total</span>
                                    <span className="price">{formatMoney(total)}</span>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="btn btn-success order-pay"
                                    disabled={cart.length === 0}
                                >
                                    <Receipt size={19} /> Pay {formatMoney(total)}
                                </button>
                            </div>
                        </>
                    )}
                </aside>
            </div>

            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                total={total}
                onPayment={handlePayment}
            />

            {/* TOUCHSCREEN KEYPAD MODAL */}
            {isKeypadOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', width: '340px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Open Item Value</h3>
                            <button onClick={() => setCustomInput('')} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Clear</button>
                        </div>
                        
                        <div style={{ fontSize: '2.5rem', textAlign: 'right', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', minHeight: '70px', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 'bold', letterSpacing: '1px' }}>
                            {customInput ? `${customInput}` : '0'}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(key => (
                                <button
                                    key={key}
                                    onClick={() => handleKeypadPress(key)}
                                    style={{ 
                                        padding: '20px', fontSize: '1.5rem', borderRadius: '8px', 
                                        border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', 
                                        cursor: 'pointer', fontWeight: 'bold', color: '#334155'
                                    }}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => { setIsKeypadOpen(false); setCustomInput(''); }} style={{ flex: 1, padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleAddCustomPrice} style={{ flex: 2, padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Add to Bill</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default POS;