const authService = require('../../../application/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
  
  async getProfile(req, res, next) {
    try {
      res.status(200).json({ success: true, user: req.user });
    } catch(error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const result = await authService.updateProfile(req.user.id, req.body);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
