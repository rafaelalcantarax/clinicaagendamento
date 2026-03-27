
const env = require('../../config/env');

class WhatsAppProvider {
  /**
   * Envia mensagem de texto via Uazapi utilizando o padrão fornecido pelo usuário:
   * POST /send/text
   * Header: token
   * Body: { number, text }
   */
  async sendMessage(number, text) {
    try {
      // Endpoint exato: /send/text
      const url = `${env.UAZAPI_URL}/send/text`;
      
      console.log(`[WhatsAppProvider] Disparando POST para: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': env.UAZAPI_TOKEN // Header obrigatório conforme especificado
        },
        body: JSON.stringify({
          number: number, // Formato: 55DDDNÚMERO
          text: text
        })
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }

      if (!response.ok) {
        console.error(`[WhatsAppProvider] Falha na Uazapi (${response.status}):`, data);
        throw new Error(data.message || 'Falha na API Uazapi');
      }

      return { success: true, data };
    } catch (error) {
      console.error('[WhatsAppProvider] Erro crítico no envio:', error.message);
      throw error;
    }
  }

  async sendTemplate(to, templateName, variables) {
    const message = `Aviso: ${templateName} para ${JSON.stringify(variables)}`;
    return this.sendMessage(to, message);
  }
}

module.exports = new WhatsAppProvider();
