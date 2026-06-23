const { createClient } = require('redis');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // 1. Importamos mysql2/promise
const app = express();
const PORT = 3000;


const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta';

app.post('/api/register', async (req, res) => {
    const {first_name, last_name, email, password, phone_number} = req.body;

    if (!first_name || !last_name || !email || !password || !phone_number) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    const connection = await pool.getConnection();
    try{
        const [existing] = await connection.query(
            'SELECT user_id FROM users WHERE email = ?', [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await connection.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, phone_number) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, password_hash, phone_number || null ]
        );
        // Generamos el token JWT con el user_id recién creado
        // El result de un INSERT con mysql2/promise devuelve un objeto con insertId
        const token = jwt.sign({ userId: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' }
    );

        res.status(201).json({ user: {id : result.insertId, first_name, last_name, email}, token });
    }catch(err){
        console.error('Error en /api/register:', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }finally{
        connection.release();
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password){
        return res.status(400).json({error: 'email y contraseña requeridos'});
    }

    const connection = await pool.getConnection();
    try{
        const [rows] = await connection.query(
            'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]
        );
        if (rows.length == 0){
            return res.status(401).json({error: 'Credenciales invalidas'})
        }
        const user = rows[0]
        const isvalid = await bcrypt.compare(password, user.password_hash);
        if (!isvalid){
            return res.status(401).json({error: 'Credenciales invalidas'})
        }

        await connection.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]
        );
        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d'}
        );

        res.json({
            token,
            user: {
                id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });
    }catch(err){
        console.log('error en el login')
        res.status(500).json({error: 'Error interno del servidor'})
    }finally{
        connection.release();
    }
});

const client = createClient({
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});

// --- 2. Configuración de la Conexión a la Base de Datos ---
// Crea un "pool" de conexiones, que es más eficiente que una única conexión.
const pool = mysql.createPool({
    host: 'localhost',          // O la IP de tu servidor de BD
    user: 'root',         // Tu usuario de MySQL
    password: '',    // Tu contraseña de MySQL
    database: 'shop', // El nombre de tu base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Construct the absolute path to client's public folder
const clientPublicPath = path.join(__dirname, '..', 'client', 'public');
app.use(express.static(clientPublicPath));

// Define CORS options
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};

// Middleware to parse JSON
app.use(express.json());

// Middleware to handle CORS
app.use(cors(corsOptions));
// Al inicio, FUERA de cualquier ruta:
client.connect().catch(console.error);

// La ruta corregida:
app.get('/api/products', async (req, res) => {
        
    try {
        // Redis v4 usa promesas, sin callback
        const cachedProducts = await client.get('products');
        if (cachedProducts) {
            console.log('Productos obtenidos de Redis');
            return res.json(JSON.parse(cachedProducts));
        }
        console.log('🗄️ Productos obtenidos desde MySQL');
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`
            SELECT 
                p.product_id AS id,
                p.name,
                p.price,
                p.image_url AS image,
                s.quantity AS stock
            FROM products p
            JOIN stock s ON p.product_id = s.product_id
            WHERE p.is_active = 1
        `);
        connection.release();

        await client.set('products', JSON.stringify(rows), { EX: 3600 });

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: 'Error interno del servidor al consultar los productos.' });
    }

    
    
});
app.post('/api/checkout', async (req, res) => {
    const cartItems = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: 'Carrito vacío o malformado' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const updatedStocks = [];

        for (const item of cartItems) {
            const [rows] = await connection.query(
                `SELECT quantity FROM stock WHERE product_id = ? FOR UPDATE`,
                [item.id]
            );

            if (rows.length === 0) throw new Error(`Producto con ID ${item.id} no encontrado`);

            const currentStock = rows[0].quantity;
            if (currentStock < item.quantity) throw new Error(`Stock insuficiente para el producto ${item.id}`);

            const newStock = currentStock - item.quantity;
            await connection.query(
                `UPDATE stock SET quantity = ? WHERE product_id = ?`,
                [newStock, item.id]
            );

            updatedStocks.push({ id: item.id, stock: newStock });
        }

        await connection.commit();

        // ✅ Invalidamos la cache para que el próximo GET traiga datos frescos
        await client.del('products');

        res.json(updatedStocks);

    } catch (error) {
        await connection.rollback();
        console.error("Error en /api/checkout:", error);
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});