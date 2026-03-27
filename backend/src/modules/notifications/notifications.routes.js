
const { Router } = require('express');
const whatsappProvider = require('../../integrations/whatsapp/whatsapp.provider');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

// Rota para envio manual/disparado pelo frontend
// POST /api/v1/notifications/whatsapp
router.post('/whatsapp', authMiddleware, async (req, res, next) => {
  try {
    const { number, text } = req.body;
    
    if (!number || !text) {
      return res.status(400).json({ error: 'Número e texto são obrigatórios.' });
    }

    const result = await whatsappProvider.sendMessage(number, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
