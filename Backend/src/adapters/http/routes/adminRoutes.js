const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, allowRoles } = require('../../middleware/authMiddleware');

// Protected routes (Admin only)
router.use(protect);
router.use(allowRoles('admin'));

router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

router.get('/products', adminController.getProducts);
router.put('/products/:id/approve', adminController.approveProduct);
router.put('/products/:id/reject', adminController.rejectProduct);

router.get('/orders', adminController.getOrders);
router.get('/activities', adminController.getActivities);

module.exports = router;
