import React, { useState, useContext } from 'react'; 
import { CartContext } from '../context/CartContext'; 

function ProductCard({ product }) {
    const { addToCart } = useContext(CartContext); 
    const getInitialStock = () => {
        const storedStock = localStorage.getItem(`stock_${product.id}`);
        return storedStock !== null ? parseInt(storedStock, 10) : product.stock;
    };

    const [localStock, setLocalStock] = useState(getInitialStock());
    const [quantity, setQuantity] = useState(1);
    
    const handleAddToCart = () => {
        if (quantity <= 0 || isNaN(quantity)) {
            alert("Por favor, ingresa una cantidad válida.");
            return;
        }

        if (localStock === 0) {
            alert(`No hay stock disponible para ${product.name}.`);
            return;
        }

        const addedQuantity = Math.min(quantity, localStock);
        addToCart(product, addedQuantity);
        const newStock = localStock - addedQuantity;
        setLocalStock(newStock);
        localStorage.setItem(`stock_${product.id}`, newStock);

        alert(`${addedQuantity} unidad(es) de ${product.name} agregada(s) al carrito.`);
        setQuantity(1);
    };

    return (
        <div className="product-container">
            <div className="stock">
                {localStock}x 
            </div>
            <h3>{product.name}</h3>
            <img src={product.image} alt={product.name} /> 
            <h1>${Number(product.price).toFixed(2)}</h1> 

            <div className="input-wrapper">
                <input
                    type="number"
                    min="1"
                    max={localStock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="input-quantity"
                />
                <button 
                    onClick={handleAddToCart} 
                    className="btn"
                    disabled={localStock === 0}
                >
                    🛒 
                </button>
            </div>
        </div>
    );
}

export default ProductCard;