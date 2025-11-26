import React, { useState, useEffect } from 'react';
import './Orders.css';

// Componente para un solo ítem (sin cambios)
const OrderItem = ({ item }) => (
  <li className="order-item">
    <span className="product-name">Producto ID: {item.product_id}</span>
    <span className="quantity">Cantidad: {item.quantity}</span>
    <span className="price">Precio unitario: ${parseFloat(item.price).toFixed(2)}</span>
  </li>
);

// Componente principal de órdenes (LÓGICA CORREGIDA)
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ---- LÓGICA DE CARGA UNIFICADA ----
    const loadOrders = async () => {
      // Cambia a 'false' cuando tu API esté funcionando
      const MODO_DEMO = true; 
      
      try {
        setLoading(true);
        setError(null);

        if (MODO_DEMO) {
          // --- MODO DEMO: Usa datos de muestra ---
          console.log("Ejecutando en modo demo.");
          // Simulamos un pequeño retraso de red
          await new Promise(resolve => setTimeout(resolve, 500)); 
          const sampleData = [
            {
              order_id: 101, order_date: '2025-06-10T14:30:00Z', total_amount: '1550.00', status_name: 'Enviado',
              items: [
                { order_item_id: 1, product_id: 25, quantity: 2, price: '500.00' },
                { order_item_id: 2, product_id: 30, quantity: 1, price: '550.00' },
              ],
            },
            {
              order_id: 102, order_date: '2025-06-12T18:00:00Z', total_amount: '480.50', status_name: 'Procesando',
              items: [ { order_item_id: 3, product_id: 42, quantity: 5, price: '96.10' } ],
            },
          ];
          setOrders(sampleData);
        } else {
          // MODO REAL: Llama a la API 
          console.log("Llamando a la API real en /api/orders");
          const response = await fetch('/api/orders');
          if (!response.ok) {
            throw new Error(`Error ${response.status}: La respuesta de la red no fue exitosa`);
          }
          const data = await response.json();
          setOrders(data);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // llamamos a la función que acabamos de definir.
    loadOrders();

  }, []);

  
  if (loading) return <div className="loading">Cargando órdenes...</div>;
  if (error) return <div className="error">Error al cargar las órdenes: {error}</div>;

  return (
    <div className="orders-container">
      <h1>Mis Órdenes</h1>
      {orders.length === 0 ? (
        <p>No se encontraron órdenes.</p>
      ) : (
        orders.map(order => (
          <div key={order.order_id} className="order-card">
            <div className="order-header">
              <h2>Orden #{order.order_id}</h2>
              <span className={`status ${order.status_name?.toLowerCase().replace(' ', '-')}`}>
                {order.status_name || 'Sin estado'}
              </span>
            </div>
            <div className="order-details">
              <p><strong>Fecha:</strong> {new Date(order.order_date).toLocaleDateString('es-AR')}</p>
              <p><strong>Total:</strong> ${parseFloat(order.total_amount).toFixed(2)}</p>
            </div>
            <div className="order-items-list">
              <h3>Items de la orden:</h3>
              <ul>
                {order.items.map(item => <OrderItem key={item.order_item_id} item={item} />)}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;