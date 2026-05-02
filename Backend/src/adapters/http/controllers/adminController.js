const adminService = require('../../../application/adminService');

class AdminController {
  async getUsers(req, res, next) {
    try {
      const users = await adminService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      if (req.user.id === req.params.id) {
        return res.status(403).json({ success: false, message: 'Admins cannot deactivate their own account.' });
      }
      const { isActive } = req.body;
      const user = await adminService.updateUserStatus(req.params.id, isActive);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req, res, next) {
     try {
       const products = await adminService.getAllProducts();
       res.status(200).json({ success: true, data: products });
     } catch (error) {
       next(error);
     }
  }

  async approveProduct(req, res, next) {
    try {
      const product = await adminService.approveProduct(req.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async rejectProduct(req, res, next) {
    try {
      const product = await adminService.rejectProduct(req.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = await adminService.getAllOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getActivities(req, res, next) {
    try {
      const activities = await adminService.getActivities();
      res.status(200).json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
