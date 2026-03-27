
const authService = require('./auth.service');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.authenticate(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
