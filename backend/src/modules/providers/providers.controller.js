
const providersService = require('./providers.service');

class ProvidersController {
  async list(req, res, next) {
    try {
      const providers = await providersService.list(req.clinicContext);
      res.json(providers);
    } catch (e) { next(e); }
  }

  async create(req, res, next) {
    try {
      const provider = await providersService.create(req.body, req.clinicContext);
      res.status(201).json(provider);
    } catch (e) { next(e); }
  }

  async update(req, res, next) {
    try {
      const updated = await providersService.update(req.params.id, req.body);
      res.json(updated);
    } catch (e) { next(e); }
  }
}

module.exports = new ProvidersController();
