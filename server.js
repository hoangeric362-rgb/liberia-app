const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/nhanvien',    require('./routes/nhanvien'));
app.use('/api/hoivien',     require('./routes/hoivien'));
app.use('/api/sach',        require('./routes/sach'));
app.use('/api/themuonsach', require('./routes/themuonsach'));
app.use('/api/auth',        require('./routes/auth'));

// Pages
app.get('/',         (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/admin',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/hoivien',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'hoivien.html')));
app.get('/nhanvien', (req, res) => res.sendFile(path.join(__dirname, 'public', 'nhanvien.html')));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
