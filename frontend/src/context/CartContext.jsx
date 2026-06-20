import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (item) => item.productId === product._id
            );

            if (existingItemIndex >= 0) {
                // YES: It exists. 
                // We use .map() to create a strictly brand-new array and a brand-new object
                return prevCart.map((item, index) => 
                    index === existingItemIndex 
                        ? { ...item, quantity: item.quantity + 1 } // Completely new object
                        : item
                );
            } else {
                // NO: It's a new item. Add it to the bottom.
                return [
                    ...prevCart,
                    {
                        productId: product._id,
                        name: product.name,
                        priceAtSale: product.price,
                        quantity: 1,
                    },
                ];
            }
        });
    };

    // The function used by your new "X" button
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    };

    // Drops quantity by 1; removes the line entirely once it hits 0
    const decreaseFromCart = (productId) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider value={{ cart, addToCart, clearCart, removeFromCart, decreaseFromCart }}>
            {children}
        </CartContext.Provider>
    );
};