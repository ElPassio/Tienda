import React, { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {

    const [cartItems, setCartItems] = useState(() => {
       try {
        const localCart= localStorage.getItem("cartItems");
        return localCart ? JSON.parse(localCart) : [];
       } catch (error) {
        console.error("Error parsing cart items from localStorage:", error);
        return [];
       }
    });
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);
    const restoreStock = (productId, quantity) => {
    const currentStock = parseInt(localStorage.getItem(`stock_${productId}`)) || 0;
    const newStock = currentStock + quantity;
    localStorage.setItem(`stock_${productId}`, newStock);
};
    const addToCart = (product, quantity) => {
        setCartItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
            if (existingItemIndex > -1) {
                // If the item already exists, update its quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += quantity;
                return updatedItems;
            } else {
                // If the item does not exist, add it to the cart
                return [...prevItems, { ...product, quantity }];
            }
        });  
    }
    const removeFromCart = (id) => {
    setCartItems((prevItems) => {
        const itemToRemove = prevItems.find(item => item.id === id);
        if (itemToRemove) {
            restoreStock(id, itemToRemove.quantity);
        }
        return prevItems.filter(item => item.id !== id);
    });
};

const checkout = async () => {
    try {
        const payload = cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity
        }));

        const res = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Error al procesar el pago.");
        }

        const updatedStocks = await res.json(); // [{ id, stock }, ...]

        // 🔁 Actualizar localStorage usando el mismo formato que el resto de la app
        updatedStocks.forEach(({ id, stock }) => {
            // En lugar de usar un objeto "productStocks", actualiza cada item individualmente
            localStorage.setItem(`stock_${id}`, stock);
        });

        // 🧹 Limpiar el carrito
        setCartItems([]);

        return { success: true };

    } catch (error) {
        console.error("Checkout error:", error);
        return { success: false, message: error.message };
    }
};
const clearCart = () => setCartItems([]);
    const updateQuantity = (id, newQuantity) => {
    setCartItems((prevItems) => {
        return prevItems.map(item => {
            if (item.id === id) {
                const difference = item.quantity - newQuantity;
                if (difference === 0) return item;

                // ✅ Solo hacemos restoreStock una vez:
                const currentStock = parseInt(localStorage.getItem(`stock_${id}`)) || 0;

                if (difference < 0) {
                    // Quiero sumar cantidad → necesito más stock
                    if (currentStock + difference < 0) {
                        alert(`No hay suficiente stock para ${item.name}.`);
                        return item;
                    }
                }

                // ✅ Solo una vez y con el valor real (positivo o negativo)
                restoreStock(id, difference);

                return { ...item, quantity: newQuantity };
            }
            return item;
        });
    });
};  
    return (
        <CartContext.Provider value={{ cart: cartItems, addToCart, removeFromCart, updateQuantity, checkout, clearCart }} >
            {children}
        </CartContext.Provider>
    );
}
