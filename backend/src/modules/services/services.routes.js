
const { Router } = require('express');
const servicesController = require('./services.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', servicesController.list);
router.post('/', servicesController.create);

module.exports = router;
