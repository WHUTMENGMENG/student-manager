const express = require("express");
const router = express.Router();
const { wepay, preOrder } = require("../controller/wepay")

router.post("/pre_order", preOrder)

router.post("/wepay", wepay)


router.get('/wepayResult', function (req, res) {
    console.log("======")
    console.log(res)
})
module.exports = router