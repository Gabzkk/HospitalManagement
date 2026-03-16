const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatient);

router.post('/', authorizeRole(['STAFF', 'ADMIN', 'SECRETARY']), patientController.createPatient);
router.put('/:id', authorizeRole(['STAFF', 'ADMIN', 'SECRETARY']), patientController.updatePatient);
router.delete('/:id', authorizeRole(['STAFF', 'ADMIN']), patientController.deletePatient);

module.exports = router;
