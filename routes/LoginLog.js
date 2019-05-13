const express = require("express")
const router = express.Router()
const { getLoginLog } = require('../controller/loginLogConstroller.js')
router.get('/', getLoginLog)
module.exports = router