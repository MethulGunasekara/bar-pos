import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Pencil, Minus, Plus, Trash2, ShoppingBag, Check, Receipt } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import Topbar from '../components/Topbar';
import { formatMoney } from '../utils/format';
import './POS.css';

const POS = () => {
    const { user } = useAuth();
    const { cart, addToCart, clearCart, removeFromCart, decreaseFromCart } = useCart();
    const total = cart.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Custom');
    const [customProductIds, setCustomProductIds] = useState([]);

    // Tracks whether the right pane is currently in "Edit" mode
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
                if (clearCart) clearCart();
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

    const showCustomizer = selectedCategory === 'Custom' && isCustomizing;

    return (
        <div className="pos-screen">
            <Topbar title="POS Terminal" />

            <div className="pos-body">
                {/* MENU PANE */}
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
                        {displayProducts.length === 0 && selectedCategory === 'Custom' ? (
                            <div className="pos-empty">
                                <ShoppingBag size={28} strokeWidth={1.75} />
                                <p>Your custom menu is empty.<br />Use "Edit Custom Menu" on the right to add favorites.</p>
                            </div>
                        ) : displayProducts.length === 0 ? (
                            <div className="pos-empty">
                                <ShoppingBag size={28} strokeWidth={1.75} />
                                <p>No items in this category yet.</p>
                            </div>
                        ) : (
                            displayProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    className="product-card"
                                >
                                    <span className="product-name">{product.name}</span>
                                    <span className="product-price price">{formatMoney(product.price)}</span>
                                </button>
                            ))
                        )}
                    </div>
                </section>

                {/* ORDER PANE */}
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
        </div>
    );
};

export default POS;
