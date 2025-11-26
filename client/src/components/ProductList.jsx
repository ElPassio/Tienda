import React, { useState, useEffect, useContext } from 'react'; // 1. Importar useContext
import ProductCard from './ProductCard';
import { CartContext } from '../context/CartContext'; // 2. Importar CartContext
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cart } = useContext(CartContext); // 3. Usar el contexto para acceder al carrito

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const res = await fetch('/api/products');

                if (res.status === 304) {
                    console.log('Products not modified (304). Using cached version if available.');
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
                }

                const data = await res.json();

                // 4.Sincronizar el stock si el carrito está vacío
                if (cart.length === 0) {
                    console.log("Carrito vacío. Sincronizando stock de la BD a localStorage.");
                    data.forEach(product => {
                        localStorage.setItem(`stock_${product.id}`, product.stock);
                    });
                }
                
                setProducts(data);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchProducts();
    // 5. Añadir 'cart' a las dependencias para que se re-evalue si el carrito cambia (opcional pero recomendado)
    }, [cart]); 

    if (loading) {
        return <div>Loading products...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (products.length === 0) {
        return <div>No products found.</div>;
    }

    return (
        <div className="product-list">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductList;