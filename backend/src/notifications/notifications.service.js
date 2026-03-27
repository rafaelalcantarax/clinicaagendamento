
const { notificationQueue } = require('../jobs/queue');

class NotificationsService {
  async sendAppointmentConfirmation(appointment) {
    await notificationQueue.add('send-whatsapp', {
      to: appointment.patientPhone,
      template: 'confirmation_v1',
      variables: {
        patient: appointment.patientName,
        date: appointment.date,
        clinic: appointment.clinicName
      }
    });
  }

  async sendReminder(appointment) {
    await notificationQueue.add('send-whatsapp', {
      to: appointment.patientPhone,
      template: 'reminder_4h',
      variables: {
        patient: appointment.patientName,
        time: appointment.time
      }
    });
  }
}

module.exports = new NotificationsService();
