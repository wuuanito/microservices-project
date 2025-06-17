const express = require('express');
const router = express.Router();
const controller = require('../controllers/solicitudController');

router.get('/', controller.getAllSolicitudes);
router.post('/', controller.createSolicitud); // <- asegúrate de que esta función existe

module.exports = router;
