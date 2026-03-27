
const { Router } = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Exemplo de rotas para branding
router.get('/', (req, res) => res.json({ primaryColor: '#4f46e5', logo: null }));
router.patch('/', roleMiddleware(['admin']), (req, res) => res.json({ success: true }));

module.exports = router;
