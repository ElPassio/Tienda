    import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import Header from './components/Header';
    import ProductList from './components/ProductList';
    import Cart from './components/Cart'; 
    import Footer from './components/Footer'; 
    import Register from './components/Register';
    import Orders from './components/Orders';
    import { CartProvider } from './context/CartContext';
    import './App.css';
    import './index.css';

    function App() {
        return (
            <Router>
                <CartProvider>
                    {/* Wrap en CartProvider para controlar el estado del carrito */}
                    <div className="app-container">
                        <Header />
                        <main className="content">
                            <Routes>
                                <Route path="/" element={<ProductList />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/orders" element={<Orders />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </CartProvider>
            </Router>
        );
    }

    export default App;