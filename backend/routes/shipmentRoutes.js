const express = require('express');
const router = express.Router();
const {
  getShipments,
  updateShipment,
} = require('../controllers/shipmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getShipments);
router.put('/:id', updateShipment);

module.exports = router;
