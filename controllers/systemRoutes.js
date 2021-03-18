const express = require('express');
const router = express.Router();
const System = require('../models/systems');

router.get('/', System.getSystems);

module.exports = router