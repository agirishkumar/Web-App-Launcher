const express = require('express');
const appController = require('../controllers/appController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/launch', auth, appController.launchApp);
router.get('/user', auth, appController.getUserApps);
router.post('/:id/stop', auth, appController.stopApp);

module.exports = router;