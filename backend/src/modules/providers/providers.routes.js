
const { Router } = require('express');
const providersController = require('./providers.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', providersController.list);
router.post('/', roleMiddleware(['admin']), providersController.create);
router.patch('/:id', roleMiddleware(['admin']), providersController.update);

module.exports = router;
