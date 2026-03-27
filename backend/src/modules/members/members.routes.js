
const { Router } = require('express');
const membersController = require('./members.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', membersController.list);
router.post('/invite', roleMiddleware(['admin']), membersController.invite);
router.delete('/:id', roleMiddleware(['admin']), membersController.remove);

module.exports = router;
