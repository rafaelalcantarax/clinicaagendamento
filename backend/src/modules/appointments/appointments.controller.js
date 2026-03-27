
const appointmentsService = require('./appointments.service');
const logger = require('../../lib/logger');

class AppointmentsController {
  async list(req, res, next) {
    try {
      const { clinicContext } = req;
      const appointments = await appointmentsService.listAll(clinicContext);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const appointment = await appointmentsService.create(req.body, req.clinicContext);
      logger.info(`Agendamento criado: ${appointment.id}`);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      await appointmentsService.cancel(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentsController();
