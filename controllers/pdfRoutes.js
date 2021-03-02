const express = require('express')
const router = express.Router();
const Pdfs = require('../models/pdf')

router.post('/', Pdfs.makePdf)

module.exports = router