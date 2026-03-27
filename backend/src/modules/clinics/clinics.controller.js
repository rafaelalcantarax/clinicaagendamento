
const clinicsService = require('./clinics.service');

class ClinicsController {
  async getMe(req, res, next) {
    try {
      const clinic = await clinicsService.getBySlug(req.clinicContext);
      res.json(clinic);
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const updated = await clinicsService.update(req.clinicContext, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClinicsController();
