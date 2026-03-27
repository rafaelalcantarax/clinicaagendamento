
// Mock de filas para o MVP
class QueueManager {
  constructor(name) {
    this.name = name;
  }

  async add(jobName, data) {
    console.log(`[Queue:${this.name}] Job added: ${jobName}`, data);
    return { id: 'job_' + Math.random() };
  }
}

const notificationQueue = new QueueManager('notifications');
const reminderQueue = new QueueManager('reminders');

module.exports = { notificationQueue, reminderQueue };
