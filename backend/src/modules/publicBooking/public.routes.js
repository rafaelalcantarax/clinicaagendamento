
const { Router } = require('express');
const publicController = require('./public.controller');

const router = Router();

// /api/v1/public/...
router.get('/clinic/:slug', publicController.getClinicInfo);
router.get('/slots', publicController.getSlots);
router.post('/booking/:slug', publicController.createBooking);

module.exports = router;
