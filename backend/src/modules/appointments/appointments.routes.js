
const { Router } = require('express');
const appointmentsController = require('./appointments.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', appointmentsController.list);
router.post('/', roleMiddleware(['admin', 'staff']), appointmentsController.create);
router.delete('/:id', roleMiddleware(['admin']), appointmentsController.cancel);

module.exports = router;
