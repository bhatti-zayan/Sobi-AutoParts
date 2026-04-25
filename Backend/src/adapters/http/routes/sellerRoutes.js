const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect, allowRoles } = require('../../middleware/authMiddleware');

// Protected routes (Seller only)
router.use(protect);
router.use(allowRoles('seller'));

router.post('/products', sellerController.createProduct);
router.get('/products', sellerController.getProducts);
router.put('/products/:id', sellerController.updateProduct);
router.delete('/products/:id', sellerController.deleteProduct);

router.get('/orders', sellerController.getOrders);

module.exports = router;
