const express = require("express");
const router = express.Router();
const { payment, preOrder, payResult } = require("../controller/wepay")
const xml2json = require("../utils/xml2json")
//生成预支付
router.post("/pre_order", preOrder)
//支付
router.post("/payment", payment)
//支付结果
router.post('/payResult', function (req, res) {
    console.log("-----55555------")
    payResult(req, res)
})
module.exports = router