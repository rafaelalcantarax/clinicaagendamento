
const prisma = require('../../lib/prisma');
const notificationsService = require('../../notifications/notifications.service');
const logger = require('../../lib/logger');

/**
 * Worker que roda periodicamente para buscar agendamentos
 * que acontecerão nas próximas 4 horas e enviar lembretes.
 */
const processReminders = async () => {
  try {
    const now = new Date();
    const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: now, lte: fourHoursLater },
        status: 'scheduled',
        reminderSent: false
      }
    });

    for (const apt of appointments) {
      await notificationsService.sendReminder(apt);
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { reminderSent: true }
      });
      logger.info(`Lembrete enviado para o agendamento ${apt.id}`);
    }
  } catch (error) {
    logger.error('Erro ao processar lembretes', error);
  }
};

module.exports = processReminders;
