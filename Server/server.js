import express from 'express';

const app = express();
const PORT = 3000;

const products = [
    { id: 1, name: 'Product 1', price: 100, image: 'images/question-sign.png', stock: 10 },
    { id: 2, name: 'Product 2', price: 200, image: 'images/question-sign.png', stock: 20 },
    { id: 3, name: 'Product 3', price: 300, image: 'images/question-sign.png', stock: 30 },
    { id: 4, name: 'Product 4', price: 400, image: 'images/question-sign.png', stock: 40 },
    { id: 5, name: 'Product 5', price: 500, image: 'images/question-sign.png', stock: 50 },
    { id: 6, name: 'Product 6', price: 600, image: 'images/question-sign.png', stock: 60 },
    { id: 7, name: 'Product 7', price: 700, image: 'images/question-sign.png', stock: 70 },
    { id: 8, name: 'Product 8', price: 800, image: 'images/question-sign.png', stock: 80 },
    { id: 9, name: 'Product 9', price: 900, image: 'images/question-sign.png', stock: 90 },
    { id: 10, name: 'Product 10', price: 1000, image: 'images/question-sign.png', stock: 100 } 
];

// Middleware to parse JSON
app.use(express.json());

app.use("/", express.static("front"));

// Basic route

app.get('/api/products', (req, res) => {
    res.send(products);
});

app.get('/api/products/:id', (req, res) => {
    res.send()
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});