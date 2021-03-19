const express = require('express')
const router = express.Router();
const Data = require('../models/data')

router.post('/', Data.saveData)

module.exports = router