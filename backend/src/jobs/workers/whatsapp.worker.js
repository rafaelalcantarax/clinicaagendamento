
const whatsappProvider = require('../../integrations/whatsapp/whatsapp.provider');
const logger = require('../../lib/logger');

/**
 * Worker que consome a fila de notificações.
 * No MVP, isso pode ser chamado manualmente ou via processador BullMQ.
 */
const processWhatsAppQueue = async (job) => {
  const { to, template, variables } = job.data;
  
  try {
    logger.info(`Processando mensagem para ${to} [Template: ${template}]`);
    
    // Aqui seria a integração real com o provedor (Z-API, etc)
    const result = await whatsappProvider.sendTemplate(to, template, variables);
    
    return result;
  } catch (error) {
    logger.error(`Falha ao enviar WhatsApp para ${to}`, error);
    throw error;
  }
};

module.exports = processWhatsAppQueue;
