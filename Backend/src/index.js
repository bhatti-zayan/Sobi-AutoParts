const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./adapters/middleware/errorHandler');

const authRoutes = require('./adapters/http/routes/authRoutes');
// const buyerRoutes = require('./adapters/http/routes/buyerRoutes');
// const sellerRoutes = require('./adapters/http/routes/sellerRoutes');
// const adminRoutes = require('./adapters/http/routes/adminRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/buyer', buyerRoutes);
// app.use('/api/seller', sellerRoutes);
// app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Sobi Autoparts API is running (Hexagonal Architecture)' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
