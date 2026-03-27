
const { Router } = require('express');
const availabilityController = require('./availability.controller');

const router = Router();

router.get('/slots', availabilityController.getSlots);

module.exports = router;
