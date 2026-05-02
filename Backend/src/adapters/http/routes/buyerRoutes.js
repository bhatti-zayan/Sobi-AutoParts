const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const { protect, allowRoles } = require('../../middleware/authMiddleware');

router.get('/products', buyerController.getProducts);
router.get('/products/:id', buyerController.getProduct);

// Protected routes (Buyer only)
router.use(protect);
router.use(allowRoles('buyer'));

router.post('/orders', buyerController.placeOrder);
router.get('/orders', buyerController.getOrders);
router.post('/bids', buyerController.placeBid);
router.post('/offers', buyerController.makeOffer);
router.get('/bids', buyerController.getBids);
router.get('/offers', buyerController.getOffers);

module.exports = router;
