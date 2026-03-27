
const servicesService = require('./services.service');

class ServicesController {
  async list(req, res, next) {
    try {
      const services = await servicesService.list(req.clinicContext);
      res.json(services);
    } catch (e) { next(e); }
  }

  async create(req, res, next) {
    try {
      const service = await servicesService.create(req.body, req.clinicContext);
      res.status(201).json(service);
    } catch (e) { next(e); }
  }
}

module.exports = new ServicesController();
