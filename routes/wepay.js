const express = require("express");
const router = express.Router();
const { payment, preOrder } = require("../controller/wepay")
const xml2json = require("../utils/xml2json")
router.post("/pre_order", preOrder)

router.post("/payment", payment)


router.get('/payResult', function (req, res) {
    console.log("======")
    console.log(req.query)
    res.send("999")
})
module.exports = router