
const { Router } = require('express');
const clinicsController = require('./clinics.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/me', clinicsController.getMe);
router.put('/settings', roleMiddleware(['admin']), clinicsController.updateSettings);

module.exports = router;
