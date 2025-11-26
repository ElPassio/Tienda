import React , { useContext, useState, useRef, useEffect }from 'react'
import './Header.css'
import { Link, useNavigate } from 'react-router-dom' 
import { CartContext } from '../context/CartContext'

function Header() {
  // Importing necessary hooks and context
  const {cart} = useContext(CartContext);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0); // Calculating total items in the cart
  const [showLogin, setShowLogin] = useState(false);
  const loginBtnRef = useRef(null); // Reference for the login button
  const loginBoxRef = useRef(null); // Reference for the login box
  // Using useRef to manage the login box visibility and click events
    const navigate = useNavigate(); // Hook to programmatically navigate

const toggleLoginForm = () => {
  setShowLogin(!showLogin);
}
 const handleRegisterClick = () => {
    setShowLogin(false);
    navigate('/register');
  };
useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        // Check if the click is outside the login box and button
        loginBoxRef.current &&
        !loginBoxRef.current.contains(e.target) &&
        (!loginBtnRef.current || !loginBtnRef.current.contains(e.target))
      ) {
        // If so, close the login box
        setShowLogin(false);
      }
    };
    if (showLogin) {// If the login box is shown, add the event listener
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    // Cleanup event listener on component unmount or when showLogin changes
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLogin]);
  return (
    <header>
        <h1>Tienda</h1>
        <nav id="main-nav">
          <a href="/" data-link>Inicio</a>
          <a href="/contacto" data-link>Contacto</a>
          <Link to="/orders" data-link>Mis Órdenes</Link>
        </nav>
        <nav id="user-nav">
            <Link  to="/cart">
            Cart ({totalItems})
            </Link>
          <button>idioma</button>
          <button className="mdi mdi-account" onClick={toggleLoginForm}> login</button>
        {showLogin && (
        <div className="login-dropdown" ref={loginBoxRef}>
                    <p>Log In</p>
          <input type="text" placeholder="Email / Phone number" />
          <input type="password" placeholder="Password" />
          <button className="login-btn">Log In</button>
                    <p>You don't have an account?</p>
          <Link to="/register" className="register-btn" onClick={handleRegisterClick}>Register</Link>
        </div>
      )}
        </nav>

      </header>
  )
}

export default Header